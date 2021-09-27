from __future__ import annotations

import asyncio
import logging
import os
from abc import ABC
from typing import Dict, Generic, TypeVar

from pydantic import Field

from .runtime_config import RuntimeConfig

logger = logging.getLogger("uvicorn")

ConfigType = TypeVar('ConfigType', bound=RuntimeConfig)

loop = asyncio.get_event_loop()


class Runtime(ABC, Generic[ConfigType]):
    _config: ConfigType = Field(default=None,
                                description="Configuration of the DeploymentRuntime env.")

    def __init__(self, config: ConfigType):
        self._config = config

    @property
    def config(self) -> ConfigType:
        return self._config

    def environment(self) -> Dict:
        env = {}
        env["MLFLOW_TRACKING_URI"] = os.getenv("MLFLOW_TRACKING_URI")
        env["MLFLOW_TRACKING_USERNAME"] = os.getenv("MLFLOW_TRACKING_USERNAME", "")
        env["MLFLOW_TRACKING_PASSWORD"] = os.getenv("MLFLOW_TRACKING_PASSWORD", "")
        env["MLFLOW_S3_ENDPOINT_URL"] = os.getenv("MLFLOW_S3_ENDPOINT_URL")
        env["AWS_ACCESS_KEY_ID"] = os.getenv("AWS_ACCESS_KEY_ID")
        env["AWS_SECRET_ACCESS_KEY"] = os.getenv("AWS_SECRET_ACCESS_KEY")
        env["GITHUB_TOKEN"] = os.getenv("GITHUB_TOKEN")
        return env
