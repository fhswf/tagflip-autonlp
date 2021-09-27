from typing import Union

from fastapi import Body, HTTPException
from fastapi_utils.inferring_router import InferringRouter
from starlette import status
from starlette.responses import PlainTextResponse

from deployments import DeploymentService
from deployments.entities.deployment_info import DeploymentInfo
from deployments.runtimes import DeploymentRuntimeService
from deployments.runtimes.docker import DockerDeploymentTask

router = InferringRouter(tags=["Deployment"],
                         prefix='/deployment')


@router.post("/")
def deploy_model(deployment_task: Union[DockerDeploymentTask] = Body(default=None,
                                                                     description="An object that describes the deployment")) -> DeploymentInfo:
    runtime_name = deployment_task.runtime
    runtime_service = DeploymentRuntimeService()
    if not runtime_service.contains(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Given runtime name does not exist.")

    if not runtime_service.find_one(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                            detail="Given runtime is not marked as training runtime.")

    deployment = DeploymentService().deploy(deployment_task)
    return deployment


@router.get("/{deployment_id}/runtime/{runtime}")
def get_deployment(runtime: str, deployment_id: str) -> DeploymentInfo:
    runtime_name = runtime
    runtime_service = DeploymentRuntimeService()
    if not runtime_service.contains(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Given runtime name does not exist.")
    if not runtime_service.find_one(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                            detail="Given runtime is not marked as training runtime.")

    deployment = DeploymentService().get_deployment(runtime_name, deployment_id)
    return deployment


@router.delete("/{deployment_id}/runtime/{runtime}")
def delete_deployment(runtime: str, deployment_id: str):
    runtime_name = runtime
    runtime_service = DeploymentRuntimeService()
    if not runtime_service.contains(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Given runtime name does not exist.")
    if not runtime_service.find_one(runtime_name):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                            detail="Given runtime is not marked as training runtime.")

    DeploymentService().undeploy(runtime_name, deployment_id)
    return PlainTextResponse(status_code=status.HTTP_202_ACCEPTED, content="")
