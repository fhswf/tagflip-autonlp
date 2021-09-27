from typing import List, Literal, Optional, Tuple, Union

from pydantic import BaseModel

TypeString = Union[Literal["float"], Literal["number"], Literal["int"], Literal["boolean"], Literal["string"]]
ScalarType = Union[int, bool, float, str]
FiniteValues = List[ScalarType]

RegEx = str


class ParameterDefinition(BaseModel):
    name: str
    choice: Optional[Union[FiniteValues]]
    range: Optional[Tuple[ScalarType, ScalarType]]
    regex: Optional[RegEx]
    type: Optional[Union[TypeString]]
    description: Optional[str]
    optional: Optional[bool]
    readable_name: Optional[str]
    default: Optional[ScalarType]
