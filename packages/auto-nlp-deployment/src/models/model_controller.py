from typing import List, Optional

from fastapi_utils.inferring_router import InferringRouter

from models import ModelService
from models.model_info import ModelInfo

router = InferringRouter(tags=["Model Registry"],
                         prefix='/model')


@router.get("/")
def get_deployable_models(project_id: str) -> List[ModelInfo]:
    return ModelService().get_deployable_models(project_id)


@router.get("/run/{run_id}")
def get_deployable_model(run_id: str) -> ModelInfo:
    return ModelService().get_deployable_model(run_id)
