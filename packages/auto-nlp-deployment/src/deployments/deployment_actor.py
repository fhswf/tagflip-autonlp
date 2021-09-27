from abc import abstractmethod
from typing import Any, Dict, final

from dramatiq import GenericActor
from pydantic.generics import GenericModel

from deployments.entities.deployment_info import DeploymentInfo
from models.model_info import ModelInfo

DEPLOYMENT_TIME_LIMIT_MSECS = 1000 * 60 * 60 * 1

class DeploymentDescription(GenericModel):
    deployment_id: str
    model: ModelInfo
    parameters: Dict[str, Any]
    runtime_config: Dict[str, Any]
    env_vars: Dict[str, str]


class DeploymentActor(GenericActor):
    class Meta:
        abstract = True
        queue_name = "auto-nlp-deployments"
        max_retries = 0
        store_results = True
        time_limit = DEPLOYMENT_TIME_LIMIT_MSECS

    @final
    def perform(self, deployment_description_json: str,
                **kwargs):  # parameters for this method are okay since GenericActor calls perform() with kwargs
        # deployment_description = DeploymentDescription.parse_raw(deployment_description_json)
        self.logger.info(deployment_description_json)
        deployment_description = DeploymentDescription.parse_raw(deployment_description_json)
        print(deployment_description)
        deployment_info = self.deploy(deployment_description, **kwargs)
        return deployment_info.json()

    @abstractmethod
    def deploy(self, deployment_description: DeploymentDescription, **kwargs) -> DeploymentInfo:
        raise NotImplementedError()
