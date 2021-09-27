from pydantic import BaseModel

from deployments.entities.deployment_task import DeploymentTask


class DockerDeploymentParameters(BaseModel):
    worker_count: int


class DockerDeploymentTask(DeploymentTask[DockerDeploymentParameters]):
    pass
