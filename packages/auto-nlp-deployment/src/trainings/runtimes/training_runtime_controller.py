from typing import List, Optional, Union

from fastapi_utils.inferring_router import InferringRouter

from common.runtimes import RuntimeConfig
from .docker import DockerTrainingRuntimeConfig
from .kubernetes import KubernetesTrainingRuntimeConfig
from .training_runtime import TrainingRuntime
from .training_runtime_service import TrainingRuntimeService

router = InferringRouter(tags=["Training"], prefix="/training/runtime")


@router.get("/")
def get_training_runtime_environments(runtime_type: Optional[str] = None) -> List[Union[
    DockerTrainingRuntimeConfig, KubernetesTrainingRuntimeConfig, RuntimeConfig]]:
    runtime_service = TrainingRuntimeService()
    if not runtime_type:
        return list(map(lambda x: x.config, runtime_service.find_all()))
    return list(map(lambda x: x.config, runtime_service.find_all_by_type(runtime_type)))


@router.get("/types")
def get_training_runtime_environment_types() -> List[str]:
    return list(map(lambda x: x, TrainingRuntime.get_known_environments().keys()))


@router.get("/{runtime}")
def get_training_runtime_environment(runtime: str) -> Union[
    DockerTrainingRuntimeConfig, KubernetesTrainingRuntimeConfig, RuntimeConfig]:
    runtime_service = TrainingRuntimeService()
    return runtime_service.find_one(runtime).config
