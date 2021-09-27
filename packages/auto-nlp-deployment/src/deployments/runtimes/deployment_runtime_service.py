from typing import Dict, List

from fastapi import HTTPException
from pydantic import Field
from starlette import status

from util import Singleton
from .deployment_runtime import DeploymentRuntime


class DeploymentRuntimeService(Singleton):
    deployment_runtime_environments: Dict[str, DeploymentRuntime] = Field(default=None,
                                                                          description="List of deployment "
                                                                                      "runtime environments.")

    def _init(self, **kwargs):
        super().__init__(**kwargs)
        from config import app_config

        self.deployment_runtime_environments = dict()
        deployment_runtimes = app_config['deployment-environments']
        known_deployment_runtimes = DeploymentRuntime.get_known_environments()
        for deployment_runtime_type in deployment_runtimes.keys():
            clazz = known_deployment_runtimes[
                deployment_runtime_type] if deployment_runtime_type in known_deployment_runtimes else None
            if not clazz:
                raise Exception(f"Unknown DeploymentRuntime type {deployment_runtime_type}")

            for config_dict in deployment_runtimes[deployment_runtime_type]:
                deployment_runtime = clazz(config_dict)
                self.deployment_runtime_environments[deployment_runtime.config.name] = deployment_runtime

    def contains(self, name: str):
        return name in self.deployment_runtime_environments.keys()

    def find_one(self, name: str) -> DeploymentRuntime:
        if name not in self.deployment_runtime_environments:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="DeploymentRuntime for given name does not exist!")
        return self.deployment_runtime_environments[name]

    def find_all_by_type(self, type: str) -> List[DeploymentRuntime]:
        if type not in DeploymentRuntime.get_known_environments():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"DeploymentRuntime of '{type}' does not exist!")
        clazz = DeploymentRuntime.get_known_environments()[type]
        return list(filter(lambda x: isinstance(x, clazz), self.find_all()))

    def find_all(self) -> List[DeploymentRuntime]:
        return list(self.deployment_runtime_environments.values())
