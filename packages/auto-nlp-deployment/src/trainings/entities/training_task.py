from __future__ import annotations

from typing import Any, Dict, Generic, TypeVar

from pydantic import Field
from pydantic.generics import GenericModel

RuntimeParameters = TypeVar('RuntimeParameters')


class TrainingTask(GenericModel, Generic[RuntimeParameters]):
    project_id: str = Field(default=None, description="The identifier of the project")

    training_id: str = Field(default=None, description="The identifier of the training")

    script_url: str = Field(default=None,
                            description="Specifies the location of the script which will be used for training.")

    parameters: Dict[str, Any] = Field(default={}, description="Parameters used for training.")

    runtime: str = Field(default=None,
                         description="The name of the runtime as defined in persistent configuration of training_runtimes.")

    runtime_parameters: RuntimeParameters = Field(default=None,
                                                  description="An object of runtime specific parameters which will be applied during training.")
