from __future__ import annotations

import asyncio
import logging
from typing import Optional, TypeVar

from dramatiq.results import ResultFailure, ResultMissing
from fastapi import HTTPException
from starlette import status

from common.redis import create_redis_client
from deployments.entities.deployment_info import DeploymentInfo
from deployments.entities.deployment_task import DeploymentTask
from deployments.entities.pending_deployment import PendingDeployment
from util import Singleton
from .entities import DeploymentStatus
from .runtimes import DeploymentRuntimeService
from .runtimes.deployment_runtime import DeploymentRuntime

logger = logging.getLogger("uvicorn")
loop = asyncio.get_event_loop()

DeploymentId = TypeVar('DeploymentId', bound=str)
RuntimeName = TypeVar('RuntimeName', bound=str)

REDIS_KEY_PENDING_DEPLOYMENT_PREFIX = "auto-nlp-pending-deployment:"
PENDING_DEPLOYMENT_EXPIRE_SEC = 30 * 60


class DeploymentService(Singleton):

    def _init(self, *args, **kwds):
        self._runtime_service = DeploymentRuntimeService()
        self._redis = create_redis_client()

    def deploy(self, deployment_task: DeploymentTask) -> DeploymentInfo:
        runtime_name = deployment_task.runtime

        if not self._runtime_service.contains(runtime_name):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"DeploymentRuntime for name {runtime_name} not found.")

        runtime: DeploymentRuntime = self._runtime_service.find_one(runtime_name)
        pending_deployment: PendingDeployment = runtime.deploy(deployment_task)

        logger.info(f"Persisting pending deployment for message {pending_deployment.dramatiq_message.message_id}")
        self._set_pending_deployment(pending_deployment)

        return DeploymentInfo(deployment_id=pending_deployment.deployment_id, runtime=pending_deployment.runtime,
                              status=DeploymentStatus.PENDING)

    def undeploy(self, runtime_name: str, deployment_id: str) -> None:
        if not self._runtime_service.contains(runtime_name):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"DeploymentRuntime for name {runtime_name} not found.")
        runtime = self._runtime_service.find_one(runtime_name)

        pending_deployment = self._get_pending_deployment(deployment_id)
        if pending_deployment:
            try:
                result = pending_deployment.dramatiq_message.get_result()
                logger.info(result)
            except ResultMissing:
                raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED)

        runtime.undeploy(deployment_id)

    def get_deployment(self, runtime_name: str, deployment_id: str):
        if not self._runtime_service.contains(runtime_name):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"DeploymentRuntime for name {runtime_name} not found.")
        runtime = self._runtime_service.find_one(runtime_name)

        pending_deployment = self._get_pending_deployment(deployment_id)
        if pending_deployment:
            try:
                pending_deployment.dramatiq_message.get_result()
                self._delete_pending_deployment(deployment_id)
                return runtime.get_deployment(deployment_id)
            except ResultMissing:
                logger.info(f"No results for pending deployment yet")
                return DeploymentInfo(deployment_id=pending_deployment.deployment_id,
                                      runtime=pending_deployment.runtime,
                                      status=DeploymentStatus.PENDING)
            except ResultFailure:
                logger.info(f"Deployment {deployment_id} failed.")
                self._delete_pending_deployment(deployment_id)
                return DeploymentInfo(deployment_id=pending_deployment.deployment_id,
                                      runtime=pending_deployment.runtime,
                                      status=DeploymentStatus.FAILED)

        return runtime.get_deployment(deployment_id)

    def _set_pending_deployment(self, pending_deployment: PendingDeployment):
        self._redis.setex(DeploymentService.pending_deployment_key(pending_deployment.deployment_id),
                          PENDING_DEPLOYMENT_EXPIRE_SEC,
                          pending_deployment.json())

    def _get_pending_deployment(self, deployment_id: str) -> Optional[PendingDeployment]:
        pending_deployment_key = DeploymentService.pending_deployment_key(deployment_id)
        if self._redis.exists(pending_deployment_key):
            return PendingDeployment.parse_raw(self._redis.get(pending_deployment_key))
        return None

    def _delete_pending_deployment(self, deployment_id: str) -> Optional[PendingDeployment]:
        pending_deployment_key = DeploymentService.pending_deployment_key(deployment_id)
        if self._redis.exists(pending_deployment_key):
            self._redis.delete(pending_deployment_key)

    @classmethod
    def pending_deployment_key(cls, deployment_id: str):
        return REDIS_KEY_PENDING_DEPLOYMENT_PREFIX + deployment_id

    @staticmethod
    def create_deployment_id() -> str:
        import uuid
        return str(uuid.uuid4())
