from typing import Any, Dict, Type

from pydantic import parse_obj_as

from .kubernetes_training_actor import KubernetesTrainingActor
from .kubernetes_training_runtime_config import KubernetesTrainingRuntimeConfig
from ..training_runtime import TrainingRuntime
from ...training_actor import TrainingActor


@TrainingRuntime.type('kubernetes')
class KubernetesTrainingRuntimeEnvironment(TrainingRuntime):

    def __init__(self, config: Dict[str, Any]):
        super().__init__(parse_obj_as(KubernetesTrainingRuntimeConfig, config))

    def training_actor(self) -> Type[TrainingActor]:
        return KubernetesTrainingActor
