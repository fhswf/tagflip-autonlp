from __future__ import annotations

import asyncio
import logging
from typing import List
from urllib.parse import urljoin

import mlflow
import requests
from dramatiq_abort import abort
from fastapi import HTTPException
from mlflow.entities import ViewType
from pydantic import parse_obj_as
from starlette import status

import util.mlflow
from trainings.entities.metric_info import MetricInfo, MetricStep
from trainings.entities.parameter_info import ParameterInfo
from trainings.entities.run_info import RunInfo
from trainings.entities.run_status import RunStatus
from trainings.entities.training_task import TrainingTask
from util import Singleton
from .active_runs import ActiveRuns
from .entities.pending_run import PendingRunInfo
from .pending_runs import PendingRuns
from .runtimes import TrainingRuntimeService

logger = logging.getLogger("uvicorn")
loop = asyncio.get_event_loop()

CHECK_RUN_INTERVAL = 5

REDIS_KEY_ACTIVE_RUN_PREFIX = "auto-nlp-active-run:"


class TrainingService(Singleton):
    """
    The TrainingEntity manager is a singleton instance and responsible for managing trainings in the env
    which consists of multiple runtime environments.
    """

    def _init(self, *args, **kwargs):
        self._runtime_service = TrainingRuntimeService()
        self._pending_run_service = PendingRuns()
        self._active_run_service = ActiveRuns()

    def enqueue_training(self, training_task: TrainingTask) -> PendingRunInfo:

        target_runtime = training_task.runtime

        if not self._runtime_service.contains(target_runtime):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"TrainingRuntime for name {target_runtime} not found.")

        runtime = self._runtime_service.find_one(target_runtime)

        if self._pending_run_service.exists_pending_run_for_training_id(training_task.training_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Pending training task for training is already enqueued.")

        pending_run = runtime.enqueue_training(training_task)

        self._pending_run_service.insert_pending_run(message_id=pending_run.message_id, pending_run=pending_run)

        return pending_run

    def get_active_run_by_message_id(self, message_id: str) -> RunInfo:

        active_run = self._active_run_service.get_active_run_by_message_id(message_id)
        if not active_run:
            pending_run = self._pending_run_service.get_pending_run_by_message_id(message_id=message_id)
            if pending_run:
                raise HTTPException(status_code=status.HTTP_425_TOO_EARLY,
                                    detail=f"Run for message {message_id} is in queue but not started yet.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

        return self.get_run_info(active_run.run_id)

    def stop(self, run_id: str):
        # """
        # Stops the given run identified by its id.
        # :param run_id: the MLFlow ID of the run
        # """
        active_run = self._active_run_service.get_active_run_by_run_id(run_id)
        if not active_run:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")
        abort(active_run.dramatiq_message.message_id)


    def get_run_info(self, run_id: str) -> RunInfo:
        try:
            mlflow_run = mlflow.get_run(run_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

        return RunInfo(run_id=mlflow_run.info.run_id,
                       dashboard_url=TrainingService._get_mlflow_dashboard_url(mlflow_run.info.experiment_id,
                                                                               mlflow_run.info.run_id),
                       status=RunStatus[mlflow_run.info.status])

    def delete_run_info(self, run_id: str):
        if ActiveRuns().get_active_run_by_run_id(run_id) is not None:
            return
        if self.get_run_info(run_id).status == RunStatus.RUNNING:
            return
        try:
            mlflow.delete_run(run_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

    def get_run_infos(self, project_id: str, filter: Optional[str] = None) -> List[RunInfo]:
        experiment = mlflow.get_experiment_by_name(project_id)

        if not experiment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given project does not exist.")

        mlflow_runs = mlflow.search_runs(
                experiment_ids=[experiment.experiment_id],
                run_view_type=ViewType.ACTIVE_ONLY,  # only non-deleted runs
                filter_string=filter,
                output_format="list")
        return list(
                map(lambda mlflow_run: RunInfo(run_id=mlflow_run.info.run_id,
                                               status=RunStatus[mlflow_run.info.status],
                                               dashboard_url=TrainingService._get_mlflow_dashboard_url(
                                                       mlflow_run.info.experiment_id, mlflow_run.info.run_id)),
                    mlflow_runs)
        )

    def get_run_metrics(self, run_id: str) -> List[MetricInfo]:
        try:
            mlflow_run = mlflow.get_run(run_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

        return list(
                map(lambda metric: MetricInfo(run_id=run_id, name=metric, last_value=mlflow_run.data.metrics[metric]),
                    mlflow_run.data.metrics))

    def get_run_metric(self, run_id: str, metric: str) -> MetricInfo:
        try:
            mlflow_run = mlflow.get_run(run_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

        response = requests.get(util.build_mlflow_request_url(path=f"2.0/mlflow/metrics/get-history"), params={
            "run_id": run_id,
            "metric_key": metric
        })
        if metric not in mlflow_run.data.metrics:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given metric does not exist.")

        return MetricInfo(run_id=run_id, name=metric, last_value=mlflow_run.data.metrics[metric],
                          steps=parse_obj_as(List[MetricStep], response.json()['metrics']))

    def get_run_parameter(self, run_id: str) -> ParameterInfo:
        try:
            mlflow_run = mlflow.get_run(run_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given run does not exist.")

        return ParameterInfo(run_id=run_id, parameters=dict(mlflow_run.data.params))

    @staticmethod
    def _get_mlflow_dashboard_url(project_id, run_id):
        path = f"#/experiments/{project_id}/runs/{run_id}"
        return urljoin(util.mlflow_tracking_base_url(), path)
