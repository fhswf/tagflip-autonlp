import os
from abc import ABC, abstractmethod
from typing import Dict, Literal, Optional, TypeVar, Union, final

from pydantic import BaseModel

from deployments.entities.model_signature import ModelSignature
from models.model_info import ModelInfo

DOCKER_IMAGE_PREFIX = "auto-nlp-deployment.run-"
CONTAINER_PREFIX = "auto-nlp-deployment-"

ImageID = TypeVar('ImageID', bound=str)


class DeploymentDockerImage(BaseModel, ABC):
    model: ModelInfo

    class InvocationDescription(BaseModel):
        port: int
        path: str
        method: Union[Literal["POST"], Literal["GET"], Literal["PUT"]]
        signature: Optional[ModelSignature]

    @final
    @property
    def name(self) -> ImageID:
        return DOCKER_IMAGE_PREFIX + self.model.run_id

    @abstractmethod
    def build(self):
        raise NotImplementedError()

    # @abstractmethod
    # def push(self, client: docker.DockerClient = None) -> ImageID:
    #     raise NotImplementedError()

    @abstractmethod
    def container_environment(self, **kwargs) -> Dict[str, str]:
        raise NotImplementedError()

    @abstractmethod
    def invocation_description(self) -> InvocationDescription:
        raise NotImplementedError()


class MLflowDeploymentDockerImage(DeploymentDockerImage):

    @property
    def invocation_description(self):
        return DeploymentDockerImage.InvocationDescription(port=8080, path="/invocations", method="POST")

    def container_environment(self, **kwargs) -> Dict[str, str]:
        if 'worker_count' in kwargs:
            worker_count = kwargs['worker_count']
            return {"GUNICORN_CMD_ARGS": f"--workers={str(worker_count)} --timeout 60 -k gevent"}
        return {}

    def build(self):
        # import mlflow.models.cli
        # import click
        # from click import Context

        def invoke_build():
            from mlflow.models.cli import _get_flavor_backend

            # ctx.invoke(mlflow.models.cli.build_docker, model_uri=model_uri, name=self.name)
            model_uri = self.model.source
            mlflow_home = os.getenv("MLFLOW_HOME", None)

            _get_flavor_backend(model_uri, docker_build=True).build_image(
                    model_uri, self.name, mlflow_home=mlflow_home, install_mlflow=False
            )

        invoke_build()
