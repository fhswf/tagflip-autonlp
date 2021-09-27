import logging
from typing import Any, Dict, Type

from pydantic import parse_obj_as

from .docker_training_actor import DockerTrainingActor
from .docker_training_runtime_config import DockerTrainingRuntimeConfig
from ..training_runtime import TrainingRuntime
from ...training_actor import TrainingActor

logger = logging.getLogger("uvicorn")


@TrainingRuntime.type('docker')
class DockerTrainingRuntime(TrainingRuntime[DockerTrainingRuntimeConfig]):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(parse_obj_as(DockerTrainingRuntimeConfig, config))

    def training_actor(self) -> Type[TrainingActor]:
        return DockerTrainingActor
