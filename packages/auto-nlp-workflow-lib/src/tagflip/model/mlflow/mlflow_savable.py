import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, final

import mlflow
from mlflow.models import ModelInputExample, ModelSignature
from mlflow.pyfunc import PythonModel

from ...model.savable import Savable
from ...model.autonlp_arguments import AutoNLPArguments

logger = logging.getLogger(__name__)

Name = str
Path = str


@dataclass
class LogArgs:
    artifact_path: str
    loader_module: str = None
    data_path: str = None
    code_path: str = None
    conda_env: Dict = None
    signature: ModelSignature = None
    input_example: ModelInputExample = None


class MLflowSavable(Savable, ABC):
    """
    A MLflowSavable is an instance of a model that has been trained but not saved. Calling the save_model method
    will save the model using MLflow model logging capabilities.
    """

    @final
    def save_model(self, autonlp_args: AutoNLPArguments):
        """
        Saves the model using MLflow model logging capabilities.
        :param autonlp_args: the AutoNLP Workflow arguments
        """
        local_artifacts = self.local_artifact_paths(autonlp_args)

        logged_artifacts = {}
        for name, path in local_artifacts.items():
            mlflow.log_artifact(path)
            logged_artifacts[name] = mlflow.get_artifact_uri(path)

        log_args = self.log_args(autonlp_args)
        python_model = self.python_model(autonlp_args)

        logger.info("Logging and registering model...")
        mlflow.pyfunc.log_model(
                artifact_path=log_args.artifact_path,
                python_model=python_model,
                artifacts=logged_artifacts,
                registered_model_name=autonlp_args.project_id,
                signature=log_args.signature,
                input_example=log_args.input_example,
                code_path=log_args.code_path,
                data_path=log_args.data_path,
                conda_env=log_args.conda_env,
                loader_module=log_args.loader_module
        )
        logger.info("Done.")

    @abstractmethod
    def local_artifact_paths(self, autonlp_args: AutoNLPArguments) -> Dict[Name, Path]:
        """
        Returns a dict that defines the local artifacts to be saved. The key is a name the custom PythonModel can use
        to access the artifact (dict's values) with.
        :param autonlp_args: the AutoNLP Workflow arguments
        :return: a dict containing the artifacts identified by a custom key
        """
        raise not NotImplemented("save_model")

    @abstractmethod
    def log_args(self, autonlp_args: AutoNLPArguments) -> LogArgs:
        """
        Returns an instance of LogArgs that gives meta information about logging the model.
        For details see https://www.mlflow.org/docs/latest/python_api/mlflow.pyfunc.html#mlflow.pyfunc.log_model
        :param autonlp_args: the AutoNLP Workflow arguments
        :return: an instance of LogArgs
        """
        raise not NotImplemented("python_model")

    @abstractmethod
    def python_model(self, autonlp_args: AutoNLPArguments) -> PythonModel:
        """
        Returns a custom MLflow PythonModel to be saved along with the model's artifacts, defined by function local_artifact_paths.
        :param autonlp_args: the AutoNLP Workflow arguments
        :return: the PythonModel
        """
        raise not NotImplemented("python_model")
