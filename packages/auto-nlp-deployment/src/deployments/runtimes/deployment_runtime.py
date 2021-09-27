from __future__ import annotations

import logging
from abc import abstractmethod
from typing import Dict, Generic, Type, TypeVar, final

from dramatiq import Message

from common.runtimes import Runtime, RuntimeConfig

from deployments.deployment_actor import DeploymentActor, DeploymentDescription
from deployments.entities.deployment_info import DeploymentInfo
from deployments.entities.deployment_task import DeploymentTask
from deployments.entities.pending_deployment import PendingDeployment
from models import ModelService

logger = logging.getLogger("uvicorn")

ConfigType = TypeVar('ConfigType', bound=RuntimeConfig)


class DeploymentRuntime(Runtime, Generic[ConfigType]):
    _known_environments: Dict[str, Type[DeploymentRuntime]] = {}

    def __init__(self, config: ConfigType):
        super().__init__(config)

    @final
    def deploy(self, deployment_task: DeploymentTask) -> PendingDeployment:
        from deployments.deployment_service import DeploymentService

        model = ModelService().get_deployable_model(deployment_task.run_id)
        deployment_id = DeploymentService.create_deployment_id()

        actor: Type[DeploymentActor] = self.deployment_actor()
        deployment_description = DeploymentDescription(
                deployment_id=deployment_id,
                model=model,
                runtime_config=self.config.dict(),
                parameters=deployment_task.parameters.dict(),
                env_vars=self.environment())
        logger.info(f"Deploying in actor {actor.__name__}")
        message: Message = actor.send(deployment_description.json())
        return PendingDeployment(deployment_id=deployment_id, runtime=self.config.name, message=message.encode())

    @abstractmethod
    def deployment_actor(self) -> Type[DeploymentActor]:
        raise NotImplementedError()

    def undeploy(self, deployment_id: str) -> None:
        raise NotImplementedError()

    def get_deployment(self, deployment_id: str) -> DeploymentInfo:
        raise NotImplementedError()

    @classmethod
    def type(cls, name: str):
        """
        Indicates for which deployment runtime env type the class is responsible.
        :param name: the dataset type
        """

        def decorator(clazz):
            if clazz not in DeploymentRuntime._known_environments:
                DeploymentRuntime._known_environments[name] = clazz

        return decorator

    @classmethod
    def get_known_environments(cls) -> Dict[str, Type[DeploymentRuntime]]:
        """
        Returns a dictionary of the known environments.
        :return: Dictionary of the known environments.
        """
        return cls._known_environments
