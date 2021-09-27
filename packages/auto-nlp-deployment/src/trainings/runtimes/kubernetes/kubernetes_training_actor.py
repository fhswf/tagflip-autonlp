import json
import os

import kubernetes
import mlflow
import mlflow.projects
import yaml
from mlflow.entities import RunStatus as MLFlowRunStatus
from mlflow.projects.kubernetes import KubernetesSubmittedRun
from mlflow.tracking import MlflowClient

from docker_repositories import DockerRepositoryService
from trainings.runtimes.kubernetes.kubernetes_training_runtime_config import KubernetesTrainingRuntimeConfig
from trainings.training_actor import TrainingActor, TrainingDescription
from util import find_file
from ...training_actor import Run


class KubernetesRun(Run):

    def __init__(self, submitted_run: KubernetesSubmittedRun):
        super().__init__(run_id=submitted_run.run_id)
        self._submitted_run = submitted_run
        self._client = MlflowClient()

    def wait(self):
        self._submitted_run.wait()

    def stop(self):
        # TODO: Cancelling job does not remove pods. # https://github.com/mlflow/mlflow/pull/3997
        self._submitted_run.cancel()
        kube_run = mlflow.get_run(self.run_id)
        if kube_run.info.status != MLFlowRunStatus.to_string(MLFlowRunStatus.FINISHED):
            self._client.set_terminated(run_id=self.run_id, status=MLFlowRunStatus.to_string(MLFlowRunStatus.FAILED))

    def is_running(self):
        raise NotImplementedError("Not required")


class KubernetesTrainingActor(TrainingActor):
    """
    Fails currently due to https://github.com/mlflow/mlflow/issues/3412
    """

    class Config:
        creates_mlflow_run_internally = True

    def start_run(self, training_description: TrainingDescription, tmp_dir: str, run: mlflow.ActiveRun = None,
                  **kwargs) -> Run:

        kube_runtime_config = KubernetesTrainingRuntimeConfig.parse_obj(training_description.runtime_config)
        env = training_description.env_vars

        def read_mlflow_project_file():
            ml_project_file = find_file("MLproject", training_description.script_url)
            if not ml_project_file:
                raise RuntimeError("Could not file MLproject file.")
            with open(ml_project_file, 'r') as f:
                return yaml.safe_load(f)

        def build_job_spec_template():
            if not os.path.isfile(kube_runtime_config.job_template_path):
                raise RuntimeError(
                        "Job template not found in path " + os.path.abspath(
                                kube_runtime_config.job_template_path))
            with open(kube_runtime_config.job_template_path, 'r') as f:
                job_spec = yaml.safe_load(f)
                container_spec = job_spec['spec']['template']['spec']['containers'][0]
                if 'env' not in container_spec:
                    container_spec['env'] = []
                for k, v in env.items():
                    container_spec['env'].append({"name": k, "value": v})

            target_file = os.path.join(tmp_dir, os.path.basename(kube_runtime_config.job_template_path))
            with open(target_file, 'w') as f:
                yaml.safe_dump(job_spec, f)
            return target_file

        docker_repo = DockerRepositoryService().get_repository(kube_runtime_config.repository)
        docker_repo.login()
        template_path = build_job_spec_template()
        ml_project_config = read_mlflow_project_file()

        def create_backend_config() -> str:
            backend_config = {
                "kube-context": kube_runtime_config.name,
                "repository-uri": docker_repo.image_name_for_project(ml_project_config['name']),
                "kube-job-template-path": template_path
            }
            self.logger.debug(f"Kubernetes config: {str(backend_config)}")
            file = os.path.join(tmp_dir, "kubernetes-backend-config.json")
            with open(file, 'w') as fp:
                json.dump(backend_config, fp)
            return file

        backend_config = create_backend_config()
        run = mlflow.projects.run(training_description.script_url,
                                  experiment_name=training_description.project_id,
                                  parameters=training_description.script_parameters,
                                  storage_dir=tmp_dir,
                                  backend='kubernetes',
                                  backend_config=backend_config,
                                  synchronous=False)
        return KubernetesRun(run)
