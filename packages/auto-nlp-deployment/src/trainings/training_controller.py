from typing import Any, List, Union

from fastapi import Body, HTTPException, Path
from fastapi_utils.inferring_router import InferringRouter
from starlette import status
from starlette.responses import PlainTextResponse

from trainings import TrainingService
from trainings.entities.metric_info import MetricInfo
from trainings.entities.pending_run import PendingRun, PendingRunInfo
from trainings.entities.run_info import RunInfo
from trainings.runtimes import TrainingRuntimeService
from trainings.runtimes.docker import DockerTrainingTask
from trainings.entities.parameter_info import ParameterInfo
from trainings.entities.training_task import TrainingTask

router = InferringRouter(tags=["Training"],
                         prefix='/training')


@router.post("/queue")
def enqueue_training_task(trainingTask: Union[DockerTrainingTask, TrainingTask[Any]] = Body(default=None,
                                                                                                  description="An object that describes the resources and parameters for the training.")) -> PendingRunInfo:
    runtime_name = trainingTask.runtime
    runtime_service = TrainingRuntimeService()
    if not runtime_service.contains(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Given runtime name does not exist.")

    if not runtime_service.find_one(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                            detail="Given runtime is not marked as training runtime.")

    return TrainingService().enqueue_training(trainingTask)


@router.get("/queue/{message_id}/run")
def get_active_run(message_id: str = Path(default=None,
                                                description="The ID of the message the training has been enqueued with.")) -> RunInfo:
    return TrainingService().get_active_run_by_message_id(message_id)


@router.delete("/run/{run_id}/cancel")
def cancel_training(run_id: str = Path(default=None, description="The ID of the run that should be stopped.")):
    TrainingService().stop(run_id)
    return PlainTextResponse(status_code=status.HTTP_200_OK, content="")


@router.delete("/run/{run_id}/delete")
def delete_run_info(run_id: str = Path(default=None, description="The ID of the run that should be deleted.")):
    TrainingService().delete_run_info(run_id)
    return PlainTextResponse(status_code=status.HTTP_200_OK, content="")


@router.get("/run/{run_id}")
def get_run_info(run_id: str = Path(default=None, description="The ID of the run.")) -> RunInfo:
    return TrainingService().get_run_info(run_id)


@router.get("/run/{run_id}/metric")
def get_run_metrics(run_id: str = Path(default=None, description="The ID of the run.")) \
        -> List[MetricInfo]:
    return TrainingService().get_run_metrics(run_id)


@router.get("/run/{run_id}/metric/{metric}")
def get_run_metric(
        run_id: str = Path(default=None, description="The ID of the run."),
        metric: str = Path(default=None, description="The name of the metric"),
) -> MetricInfo:
    return TrainingService().get_run_metric(run_id, metric)


@router.get("/run/{run_id}/parameter")
def get_run_parameters(run_id: str = Path(default=None, description="The ID of the run.")) -> ParameterInfo:
    return TrainingService().get_run_parameter(run_id)
