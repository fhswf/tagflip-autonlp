from typing import Literal, Optional, Union

from pydantic import AnyHttpUrl, BaseModel

from .model_signature import ModelSignature


class Endpoint(BaseModel):
    url: AnyHttpUrl
    method: Union[Literal["POST"], Literal["GET"], Literal["PUT"]]
    signature: Optional[ModelSignature]