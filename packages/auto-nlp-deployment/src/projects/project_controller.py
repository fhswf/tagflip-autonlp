from typing import List, Optional

from fastapi_utils.inferring_router import InferringRouter

from projects import ProjectService
from trainings import TrainingService
from trainings.entities.run_info import RunInfo

router = InferringRouter(tags=["Project"],
                         prefix='/project')


@router.delete("/{project_id}")
def delete_project(project_id: str) -> List[RunInfo]:
    return ProjectService().delete_project(project_id)


@router.get("/{project_id}/training/run")
def get_run_infos(project_id: str, filter: Optional[str] = None) -> List[RunInfo]:
    return TrainingService().get_run_infos(project_id, filter)