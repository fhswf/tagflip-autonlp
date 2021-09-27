import logging
from typing import Dict, List

from fastapi import HTTPException
from pydantic import Field
from starlette import status

from util import Singleton
from .training_runtime import TrainingRuntime

logger = logging.getLogger("uvicorn")


class TrainingRuntimeService(Singleton):
    training_runtimes: Dict[str, TrainingRuntime] = Field(default=None,
                                                          description="List of training "
                                                                      "runtime environments.")

    def _init(self, **kwargs):
        super().__init__(**kwargs)
        from config import app_config
        self.training_runtimes = dict()
        training_runtimes = app_config['training-environments']
        known_training_runtimes = TrainingRuntime.get_known_environments()
        for training_runtime_type in training_runtimes.keys():
            clazz = known_training_runtimes[
                training_runtime_type] if training_runtime_type in known_training_runtimes else None
            if not clazz:
                raise Exception(f"Unknown training runtime type {training_runtime_type}")

            for config_dict in training_runtimes[training_runtime_type]:
                training_runtime = clazz(config_dict)
                self.training_runtimes[training_runtime.config.name] = training_runtime

    def contains(self, name: str):
        return name in self.training_runtimes.keys()

    def find_one(self, name: str) -> TrainingRuntime:
        if name not in self.training_runtimes:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="TrainingRuntime for given name does not exist!")
        return self.training_runtimes[name]

    def find_all_by_type(self, type: str) -> List[TrainingRuntime]:
        if type not in TrainingRuntime.get_known_environments():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Training runtime env of '{type}' does not exist!")
        clazz = TrainingRuntime.get_known_environments()[type]
        return list(filter(lambda x: isinstance(x, clazz), self.find_all()))

    def find_all(self) -> List[TrainingRuntime]:
        return list(self.training_runtimes.values())
