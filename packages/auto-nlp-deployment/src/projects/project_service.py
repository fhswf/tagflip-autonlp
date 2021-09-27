from __future__ import annotations

import asyncio
import logging

import mlflow
from fastapi import HTTPException
from starlette import status

from util import Singleton

logger = logging.getLogger("uvicorn")
loop = asyncio.get_event_loop()


class ProjectService(Singleton):
    """
    The TrainingEntity manager is a singleton instance and responsible for managing trainings in the env
    which consists of multiple runtime environments.
    """

    def _init(self, *args, **kwds):
        pass

    def delete_project(self, project_id: str):
        experiment = mlflow.get_experiment_by_name(project_id)
        if not experiment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given project does not exist.")
        mlflow.delete_experiment(experiment.experiment_id)
