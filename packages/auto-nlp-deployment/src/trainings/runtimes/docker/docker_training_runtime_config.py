from typing import List, Literal, Optional

from pydantic import BaseModel, Field, parse_obj_as

from common.runtimes import RuntimeConfig
from common.runtimes.parameter_definition import ParameterDefinition
from common.runtimes.ssh_config import SSHConfig


class DockerTrainingParameterDefinitions(BaseModel):
    gpu_id: Optional[ParameterDefinition] = Field(default=None,
                                                  description="The IDs of GPUs available by the Docker runtime.")

    def __init__(self, *args, **kwargs):
        gpu_id = None
        if 'gpu_id' in kwargs:
            gpu_id = ParameterDefinition(name='gpu_id', choice=parse_obj_as(List[int], kwargs['gpu_id']['choice']),
                                         description="The IDs of the available GPUs one can choose from to heavly speed-up training.",
                                         optional=True,
                                         readable_name="GPU-Device ID")
        super(DockerTrainingParameterDefinitions, self).__init__(gpu_id=gpu_id)


class DockerTrainingRuntimeConfig(RuntimeConfig[DockerTrainingParameterDefinitions]):
    type: Literal["docker"] = "docker"
    ssh: SSHConfig = Field(default=None, description="Configuration for accessing Docker runtime remotely via ssh.")
