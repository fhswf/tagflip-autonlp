import os
import tempfile
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, final

import dramatiq
import dramatiq_abort
import mlflow
from dramatiq import GenericActor, Message
from dramatiq.middleware import CurrentMessage
from mlflow.entities import RunStatus
from mlflow.tracking import MlflowClient
from pydantic import BaseModel, Field
from tempenv import TemporaryEnvironment

import util.git
from trainings.active_runs import ActiveRuns
from trainings.entities import ActiveRun
from trainings.pending_runs import PendingRuns

TRAINING_TIME_LIMIT_MSECS = 1000 * 60 * 60 * 24 * 60
FINISHED_RUN_EXPIRATION_SECS = 60 * 60 * 24


class TrainingDescription(BaseModel):
    project_id: str = Field(default="Default", description="The ID of the project this training task belongs to."),
    script_url: str = Field(default=None,
                            description="Specifies the location of the script which will be used for training.")
    script_parameters: Dict[str, Any] = Field(default={}, description="Parameters to be passed to the training script.")
    runtime_parameters: Dict[str, Any] = Field(default={},
                                               description="Runtime specific parameters which will be applied during training.")
    runtime_config: Dict[str, Any] = Field(default={}, description="The configuration of the runtime.")
    env_vars: Dict[str, str] = Field(default={},
                                     description="The environment variables which are active during training.")


CHECK_LIFE_INTERVAL_SECS = 5


class Run(ABC):

    def __init__(self, run_id: str):
        self._run_id = run_id
        self._logger = dramatiq.get_logger(f"Run {run_id}")

    @property
    def logger(self):
        return self._logger

    @property
    def run_id(self):
        return self._run_id

    def wait(self):
        while self.is_running():
            time.sleep(CHECK_LIFE_INTERVAL_SECS)
            self.logger.debug("Checking run...")
        self.logger.info("Exiting...")

    @abstractmethod
    def stop(self):
        raise NotImplementedError()

    @abstractmethod
    def is_running(self):
        raise NotImplementedError()


class TrainingActor(GenericActor):
    class Meta:
        abstract = True
        queue_name = "auto-nlp-trainings"
        max_retries = 0
        store_results = False
        time_limit = TRAINING_TIME_LIMIT_MSECS

    class Config:
        creates_mlflow_run_internally: bool = False

    def __init__(self):
        self._config = self.Config()
        self._active_runs_service = ActiveRuns()
        self._pending_runs_service = PendingRuns()

    @final
    def perform(self, training_description_json: str, **kwargs):
        # parameters for this method are okay since GenericActor calls perform() with kwargs
        training_description = TrainingDescription.parse_raw(training_description_json)
        self.logger.info(f"Parsed training_description: {training_description}")

        message: Message = CurrentMessage.get_current_message()

        with tempfile.TemporaryDirectory(prefix="tagflip-") as tmp_dir:
            self.logger.info(f"Created temporary directory {tmp_dir}")
            with TemporaryEnvironment(training_description.env_vars):
                mlflow_run = None
                run = None
                client = MlflowClient()
                if not self._config.creates_mlflow_run_internally:
                    self.logger.info(f"Creating MLflow Run")
                    experiment = client.get_experiment_by_name(training_description.project_id)
                    mlflow_run = client.create_run(experiment_id=experiment.experiment_id)
                try:
                    if not os.path.exists(training_description.script_url):
                        self.logger.info(f"Retrieving script from {training_description.script_url}")
                        training_description.script_url = TrainingActor.script_as_local_script(
                                training_description.script_url, tmp_dir)
                    try:
                        self.logger.info(f"Starting training ...")
                        run = self.start_run(training_description, tmp_dir, run=mlflow_run)
                        self._active_runs_service.insert_active_run(message_id=message.message_id,
                                                                    active_run=ActiveRun(run_id=run.run_id,
                                                                                         message=message.encode()))
                        self._pending_runs_service.delete_pending_run_by_message_id(message_id=message.message_id)
                        self.logger.info(f"Training started. Waiting for completion...")
                        run.wait()
                    except dramatiq_abort.Abort:
                        self.logger.info("Got abortion signal...")
                        if run:
                            run.stop()
                    finally:
                        active_run = self._active_runs_service.get_active_run_by_message_id(
                                message_id=message.message_id)
                        self._active_runs_service.update_active_run(message_id=message.message_id,
                                                                    active_run=active_run,
                                                                    expiration_time=FINISHED_RUN_EXPIRATION_SECS)
                except Exception as e:
                    self.logger.error("Caught exception!", str(e))
                    if run:
                        client.set_terminated(run_id=run.run_id, status=RunStatus.to_string(RunStatus.FAILED))
                    self._active_runs_service.delete_active_run_by_message_id(message_id=message.message_id)
                    raise e
                finally:
                    self._pending_runs_service.delete_pending_run_by_message_id(message_id=message.message_id)
                    self.logger.info("Actor done.")

    @abstractmethod
    def start_run(self, training_description: TrainingDescription, tmp_dir: str, run: mlflow.ActiveRun = None,
                  **kwargs) -> Run:
        raise NotImplementedError()

    @classmethod
    def script_as_local_script(cls, script_url: str, target_dir: str):
        from wget import download

        if os.path.exists(script_url):
            # script is local
            return script_url
        if util.git.is_git_repo(script_url):
            target_dir = util.git.clone_or_pull_resolve_subdir(script_url, target_dir)
            return target_dir
        download(script_url, target_dir)
        return target_dir
