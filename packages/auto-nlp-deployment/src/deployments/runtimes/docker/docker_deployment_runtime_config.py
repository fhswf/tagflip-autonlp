from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field

from common.runtimes import ParameterDefinition, RuntimeConfig, SSHConfig

_DEFAULT: Dict[str, ParameterDefinition] = {
    "worker_count": ParameterDefinition(name="worker_count", type="int", readable_name="Max. amount of workers",
                                        description="Max. amount of workers for parallel request handling.")
}


class DockerDeploymentParameterDefinitions(BaseModel):
    worker_count: ParameterDefinition = Field(_DEFAULT["worker_count"],
                                              description="Max. amount of workers for parallel request handling.")

    def __init__(self, *args, **kwargs):
        for k in kwargs.keys():
            kwargs[k] = {"name": k, **_DEFAULT[k].dict(), **kwargs[k]}
        super().__init__(*args, **kwargs)


class DockerDeploymentRuntimeConfig(RuntimeConfig[DockerDeploymentParameterDefinitions]):
    type: Literal["docker"] = "docker"

    binding_ip: Optional[str] = Field(None, description="The fixed IP-address all containers binding will be bound to.")

    ssh: SSHConfig = Field(default=None, description="Configuration for accessing Docker runtime remotely via ssh.")

    entrypoint: str = Field(default=None,
                            description="The public endpoint deployment to access the traefik entrypoint.")

    parameters: DockerDeploymentParameterDefinitions = Field(DockerDeploymentParameterDefinitions())
