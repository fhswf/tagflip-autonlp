from typing import Any, Literal, Optional, Union

from pydantic import AnyHttpUrl, BaseModel

from deployments.entities.deployment_status import DeploymentStatus


class ModelSignature(BaseModel):
    input: Optional[Any]
    output: Optional[Any]


class Endpoint(BaseModel):
    url: AnyHttpUrl
    method: Union[Literal["POST"], Literal["GET"], Literal["PUT"]]
    signature: Optional[ModelSignature]


class DeploymentInfo(BaseModel):
    deployment_id: str

    runtime: str

    status: DeploymentStatus

    endpoint: Optional[Endpoint]
