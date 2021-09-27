import os
import signal

import mlflow
import mlflow.projects
import psutil
from mlflow.entities import RunStatus
from mlflow.projects.submitted_run import LocalSubmittedRun
from paramiko.ssh_exception import SSHException
from psutil import NoSuchProcess, TimeoutExpired

from common.exception import SSHForbiddenException
from trainings.training_actor import TrainingActor, TrainingDescription
from ...training_actor import Run

RETURN_TIMEOUT_SECS = 120
INTERRUPT_TIMEOUT_SECS = 600
TERMINATION_TIMEOUT_SECS = 30


class DockerRun(Run):

    def __init__(self, docker_run: LocalSubmittedRun):
        super().__init__(run_id=docker_run.run_id)
        self._docker_run = docker_run

    def stop(self):
        self.logger.info("Finalizing docker run. Waiting for return...")
        try:
            docker_process = psutil.Process(self._docker_run.command_proc.pid)
            if docker_process.is_running():
                docker_process.wait(RETURN_TIMEOUT_SECS)
            self.logger.info(f"Finalized run.")
        except TimeoutExpired:
            self.logger.info(f"Timeout on finalizing docker.")
            self._stop_docker_process()

    def _stop_docker_process(self):
        docker_process: psutil.Process = None
        if psutil.pid_exists(self._docker_run.command_proc.pid):
            try:
                for child in psutil.Process(self._docker_run.command_proc.pid).children(recursive=True):
                    if child.name() == "docker":
                        docker_process = child
                        break
            except NoSuchProcess:
                self.logger.info("Could not find process for docker run.")

        if docker_process:
            self.logger.info("Docker process found.")
            self.logger.info("Interrupting docker process...")
            try:
                # Try to properly exit docker process
                docker_process.send_signal(signal.SIGINT)  # CTRL + C stops training
                docker_process.wait(INTERRUPT_TIMEOUT_SECS)
                self.logger.info("Interrupted docker process.")
            except TimeoutExpired:
                # terminate docker ... a little harder since interrupt didn't work
                self.logger.info("Docker interrupt timed out.")
                docker_process.send_signal(signal.SIGTERM)
                try:
                    self.logger.warning("Terminating docker process...")
                    docker_process.wait(TERMINATION_TIMEOUT_SECS)
                except TimeoutExpired:
                    # kill docker... there is nothing we can do ...
                    # process might not be longer connected to remote docker env
                    self.logger.warning("Docker termination timed out...")
                    self.logger.warning("Kill signal sent to docker process.")
                    docker_process.send_signal(signal.SIGKILL)
        if psutil.pid_exists(self._docker_run.command_proc.pid):
            try:
                # wait for parent process again
                psutil.Process(self._docker_run.command_proc.pid).wait(RETURN_TIMEOUT_SECS)
                self.logger.info("Finalized run " + self.run_id + ".")
            except NoSuchProcess:
                self.logger.info("Finalized run " + self.run_id + ".")
            except TimeoutExpired:
                self.logger.error("Process for run " + self.run_id + " could not be finalized.")

    def is_running(self):
        try:
            run = mlflow.get_run(self.run_id)
        except Exception as e:
            self.logger.error("Could not fetch data for run from API.")
            return True

        if run.info.status == RunStatus.to_string(RunStatus.FINISHED):
            if self._docker_run.get_status() != RunStatus.to_string(RunStatus.FINISHED):
                self.logger.info("Docker run with ID " + self.run_id + " will finish soon.")
            else:
                self.logger.info("Docker run with ID " + self.run_id + " finished.")
            return False
        elif run.info.status in [RunStatus.to_string(RunStatus.FAILED),
                                 RunStatus.to_string(RunStatus.KILLED)]:
            # process failed on remote... force quit locally
            self.logger.info("Docker run failed or killed.")
            return False
        return True


class DockerTrainingActor(TrainingActor):
    class Config:
        creates_mlflow_run_internally = True

    def start_run(self, training_description: TrainingDescription, tmp_dir: str, run: mlflow.ActiveRun = None,
                  **kwargs) -> Run:
        try:
            training_description.runtime_config.get('parameters', {}).get('gpu_id', {}).get('choice', [])
            runtime_gpu_ids = sorted(
                    training_description
                        .runtime_config.get('parameters', {})
                        .get('gpu_id', {})
                        .get('choice', [])
            )
            requested_gpu_ids = {training_description.runtime_parameters['gpu_id']} if \
                training_description.runtime_parameters['gpu_id'] is not None else {}

            if len(runtime_gpu_ids) < len(requested_gpu_ids) or not set(requested_gpu_ids).issubset(runtime_gpu_ids):
                raise RuntimeError(
                        "Training requests GPUs " + str(
                                requested_gpu_ids) + ", but " + (
                            "no GPUs" if len(runtime_gpu_ids) == 0 else "only " + str(
                                    runtime_gpu_ids)) + " are available")

            docker_args = {}
            if len(requested_gpu_ids) > 0:
                docker_args.update({'gpus': '"device=' + ",".join([str(gpu) for gpu in requested_gpu_ids]) + '"'})
            docker_args.update({'add-host': 'host.docker.internal:host-gateway'})

            ssh_config = training_description.runtime_config.get('ssh', {})
            if training_description.runtime_config.get('ssh', None) is not None:
                os.environ["DOCKER_HOST"] = "ssh://{username}@{host}:{port}".format(**ssh_config)

            run = mlflow.projects.run(
                    training_description.script_url,
                    experiment_name=training_description.project_id,
                    parameters=training_description.script_parameters,
                    storage_dir=tmp_dir,
                    docker_args=docker_args,
                    synchronous=False
            )
            return DockerRun(docker_run=run)
        except SSHException as e:
            self.logger.error(e)
            raise SSHForbiddenException("Cannot access remote host via SSH. Ensure existence of SSH-key on machine.")
