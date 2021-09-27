from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

Parameters = TypeVar('Parameters', bound=BaseModel)


class DeploymentTask(GenericModel, Generic[Parameters]):
    run_id: str = Field(None, description="The id of the run the deployable model results from.")

    runtime: str = Field(default=None, description="The name of the runtime.")

    parameters: Optional[Parameters] = Field(default=None, description="An object of runtime specific parameters.")
