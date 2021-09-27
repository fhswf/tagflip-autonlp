from __future__ import annotations

import asyncio
import logging
import os
from typing import List

import mlflow
import requests
from fastapi import HTTPException
from pydantic import parse_obj_as
from starlette import status

from .model_info import ModelInfo
from trainings import TrainingService
from util import Singleton, build_mlflow_request_url

logger = logging.getLogger("uvicorn")
loop = asyncio.get_event_loop()


class ModelService(Singleton):

    def _init(self, *args, **kwds):
        pass

    def get_deployable_models(self, project_id: str) -> List[ModelInfo]:
        experiment = mlflow.get_experiment_by_name(project_id)

        if not experiment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Given project does not exist.")

        runs = TrainingService().get_run_infos(project_id)
        run_ids = set(map(lambda x: x.run_id, runs))

        url = build_mlflow_request_url(path="2.0/preview/mlflow/model-versions/search")
        response = requests.get(url, params={
            "filter": f"name='{project_id}'"
        })
        model_dict = response.json()
        if "model_versions" in model_dict.keys():
            models = parse_obj_as(List[ModelInfo], model_dict["model_versions"])
            # for model in models:
            #     model.s3_endpoint = os.getenv("MLFLOW_S3_ENDPOINT_URL")
            models = list(filter(lambda x: x.run_id in run_ids, models))
            return models
        return []

    def get_deployable_model(self, run_id: str):
        url = build_mlflow_request_url(path="2.0/preview/mlflow/model-versions/search")
        response = requests.get(url, params={
            "filter": f"run_id='{run_id}'"
        })
        model_dict = response.json()
        if "model_versions" in model_dict.keys():
            unparsed_models = model_dict["model_versions"]
            if len(unparsed_models) > 1:
                raise HTTPException(status_code=status.HTTP_300_MULTIPLE_CHOICES, detail=
                "Run id referes to multiple models. This should never happen!")

            model_info = parse_obj_as(ModelInfo, unparsed_models[0])
            # model_info.s3_endpoint = os.getenv("MLFLOW_S3_ENDPOINT_URL")
            return model_info
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No model found for run {run_id}.")
