from __future__ import annotations

import asyncio
import logging
import multiprocessing
from typing import Any, Dict, Type

import docker
from docker.errors import APIError
from docker.models.containers import Container
from fastapi import HTTPException
from pydantic import parse_obj_as
from tempenv import TemporaryEnvironment

from deployments.entities.deployment_info import DeploymentInfo
from .docker_deployment_actor import DockerDeploymentActor
from .docker_deployment_runtime_config import DockerDeploymentRuntimeConfig
from ..deployment_runtime import DeploymentRuntime
from ...deployment_actor import DeploymentActor

# from ...deployment_app.mlflow.mlflow_deployment_app import MLflowDeploymentApp

logger = logging.getLogger("uvicorn")

loop = asyncio.get_event_loop()

CONTAINER_PREFIX = "auto-nlp-deployment-"
TRAEFIK_PATH_PREFIX = "/auto-nlp-deployment"


@DeploymentRuntime.type('docker')
class DockerDeploymentRuntime(DeploymentRuntime[DockerDeploymentRuntimeConfig]):

    def __init__(self, config: Dict[str, Any]):
        super().__init__(parse_obj_as(DockerDeploymentRuntimeConfig, config))
        env = self.environment()
        if self.config.ssh is not None:
            env["DOCKER_HOST"] = "ssh://{username}@{host}:{port}".format(**self.config.ssh.dict())
        with TemporaryEnvironment(env):
            logger.info("Creating DockerDeploymentRuntime with env" + str(env))
            self._client = docker.from_env(max_pool_size=max(2 * multiprocessing.cpu_count(), 10))

    def __del__(self):
        self._client.close()

    def deployment_actor(self) -> Type[DeploymentActor]:
        return DockerDeploymentActor

    def undeploy(self, deployment_id: str) -> None:
        try:
            container_name = DockerDeploymentActor.container_name(deployment_id)
            container: Container = self._client.containers.get(container_name)
            container.stop()
            container.remove()
        except docker.errors.NotFound as e:
            raise HTTPException(status_code=404, detail=f"Docker deployment {deployment_id} not found: {e}")
        except docker.errors.APIError as e:
            raise HTTPException(status_code=500,
                                detail=f"Docker API did not return properly for deployment {deployment_id}: {e}")

    def get_deployment(self, deployment_id: str) -> DeploymentInfo:
        container_name = DockerDeploymentActor.container_name(deployment_id)
        try:
            container: Container = self._client.containers.get(container_name)
            return DockerDeploymentActor.build_deployment_info(deployment_id, self.config.name, self.config.entrypoint,
                                                               container)
        except docker.errors.NotFound:
            raise HTTPException(status_code=404, detail=f"Docker deployment {deployment_id} not found")
        except docker.errors.APIError:
            raise HTTPException(status_code=500,
                                detail=f"Docker API did not return properly for deployment {deployment_id}")
