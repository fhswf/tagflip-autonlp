from typing import List, Optional, Union

from fastapi_utils.inferring_router import InferringRouter

from common.runtimes import RuntimeConfig
from . import DeploymentRuntimeService
from .deployment_runtime import DeploymentRuntime
from .docker import DockerDeploymentRuntimeConfig

router = InferringRouter(tags=["Deployment"], prefix='/deployment/runtime')


@router.get("/")
def get_deployment_runtime_environments(runtime_type: Optional[str] = None) -> List[
    Union[DockerDeploymentRuntimeConfig, RuntimeConfig]]:
    runtime_service = DeploymentRuntimeService()
    if not runtime_type:
        return list(map(lambda x: x.config, runtime_service.find_all()))
    return list(map(lambda x: x.config, runtime_service.find_all_by_type(runtime_type)))


@router.get("/types")
def get_training_runtime_environment_types() -> List[str]:
    return list(map(lambda x: x, DeploymentRuntime.get_known_environments().keys()))


@router.get("/{runtime}")
def get_training_runtime_environment(runtime: str) -> Union[DockerDeploymentRuntimeConfig, RuntimeConfig]:
    runtime_service = DeploymentRuntimeService()
    return runtime_service.find_one(runtime).config
