from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

ParameterDefinitions = TypeVar('ParameterDefinitions', bound=BaseModel)


class RuntimeConfig(GenericModel, Generic[ParameterDefinitions]):
    type: str = Field(None)

    name: str = Field(default=None, description="Unqiue name of the Runtime Environment env.")

    description: Optional[str] = Field(default=None, description="A description for the Runtime Environment.")

    parameters: Optional[ParameterDefinitions]
