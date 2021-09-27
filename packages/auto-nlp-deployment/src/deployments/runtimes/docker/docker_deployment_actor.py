import math
from urllib.parse import urljoin

import docker
import docker.errors
from docker.models.containers import Container
from paramiko.ssh_exception import SSHException
from tempenv import TemporaryEnvironment

from common.exception import SSHForbiddenException
from deployments.deployment_actor import DeploymentActor, DeploymentDescription
from deployments.deployment_docker_image import DeploymentDockerImage, MLflowDeploymentDockerImage
from deployments.entities.deployment_info import DeploymentInfo
from deployments.entities.deployment_status import DeploymentStatus
from ...entities.endpoint import Endpoint

CONTAINER_PREFIX = "auto-nlp-deployment"
TRAEFIK_PATH_PREFIX = "/auto-nlp-deployment"

TAGFLIP_DEPLOYMENT_ID_LABEL = "tagflip.auto-nlp.deploymentId"
TAGFLIP_DEPLOYMENT_STACK_LABEL = "com.docker.compose.project"
TAGFLIP_DEPLOYMENT_STACK = "auto-nlp-deployment"
TAGFLIP_DEPLOYMENT_NETWORK = "auto-nlp-deployments"
TAGFLIP_DEPLOYMENT_INVOCATION_DESCRIPTION_LABEL = "tagflip.auto-nlp.invocation_description"


class DockerDeploymentActor(DeploymentActor):

    def deploy(self, deployment_description: DeploymentDescription,
               **kwargs) -> DeploymentInfo:

        deployment_id = deployment_description.deployment_id
        model = deployment_description.model
        parameters = deployment_description.parameters
        environment = deployment_description.env_vars
        image = MLflowDeploymentDockerImage(model=model)
        runtime_config = deployment_description.runtime_config

        if runtime_config['ssh'] is not None:
            environment["DOCKER_HOST"] = "ssh://{username}@{host}:{port}".format(**runtime_config['ssh'])

        try:
            with TemporaryEnvironment(environment):
                client = docker.from_env()
                try:
                    client.images.get(image.name)
                    self.logger.info(f"Found image {image.name} on docker host")
                except (docker.errors.ContainerError, docker.errors.APIError) as e:
                    self.logger.info(f"Building image {image.name} on docker host")
                    # image not found -> build it
                    try:
                        image.build()
                        client.images.get(image.name)
                        self.logger.info(f"Found image {image.name} on docker host after build.")
                    except (docker.errors.ContainerError, docker.errors.APIError) as e:
                        raise RuntimeError("Image could not be found. Creation might be failed.")

                container_name = DockerDeploymentActor.container_name(deployment_id)
                worker_count = parameters['worker_count']
                cpu_count = max(math.ceil(((worker_count - 1) / 2.0)), 1)

                path_prefix = DockerDeploymentActor.deployment_url_path_prefix(deployment_id)

                labels = {
                    TAGFLIP_DEPLOYMENT_ID_LABEL: deployment_id,
                    TAGFLIP_DEPLOYMENT_INVOCATION_DESCRIPTION_LABEL: image.invocation_description.json(),
                    TAGFLIP_DEPLOYMENT_STACK_LABEL: TAGFLIP_DEPLOYMENT_STACK,
                    "traefik.enable": "true",
                    f"traefik.http.routers.{container_name}.entrypoints": "web",
                    f"traefik.http.routers.{container_name}.rule": f"PathPrefix(`{path_prefix}`)",
                    f"traefik.http.services.{container_name}.loadbalancer.server.port": str(
                            image.invocation_description.port),
                    f"traefik.http.middlewares.{container_name}-strip-prefix.stripprefix.prefixes": f"{path_prefix}",
                    f"traefik.http.routers.{container_name}.middlewares": f"{container_name}-strip-prefix@docker",
                }

                self.logger.info("Starting container")
                try:
                    container: Container = client.containers.run(name=container_name,
                                                                 image=image.name,
                                                                 labels=labels,
                                                                 detach=True,
                                                                 network=TAGFLIP_DEPLOYMENT_NETWORK,
                                                                 cpu_count=cpu_count,
                                                                 restart_policy={
                                                                     "Name": "always"
                                                                 },
                                                                 environment=image.container_environment(
                                                                         worker_count=worker_count))
                    self.logger.info("Container started")
                    self.logger.info(
                            f"Building deployment info with deployment-id: {deployment_id}, runtime-name: {runtime_config['name']}, entrypoint: {runtime_config['entrypoint']}")
                    return DockerDeploymentActor.build_deployment_info(deployment_id, runtime_config['name'],
                                                                       runtime_config['entrypoint'], container)
                except (docker.errors.ContainerError, docker.errors.APIError) as e:
                    self.logger.error(f"Container count not be started: {str(e)}")
                    container = client.containers.get(container_name)
                    container.remove()
                    raise e
        except SSHException as e:
            self.logger.error(e)
            raise SSHForbiddenException("Cannot access remote host via SSH. Ensure existence of SSH-key on machine.")

    @classmethod
    def build_deployment_info(cls,
                              deployment_id: str,
                              runtime_name: str,
                              runtime_entrypoint: str,
                              container: Container):
        deployment_status = DeploymentStatus.RUNNING if container.status == 'running' else DeploymentStatus.STOPPED

        invocation_path = DeploymentDockerImage.InvocationDescription.parse_raw(
                container.labels.get(TAGFLIP_DEPLOYMENT_INVOCATION_DESCRIPTION_LABEL))
        url_path = urljoin(runtime_entrypoint,
                           "/".join(part.strip("/") for part in
                                    [DockerDeploymentActor.deployment_url_path_prefix(deployment_id),
                                     invocation_path.path]))
        return DeploymentInfo(deployment_id=deployment_id,
                              endpoint=Endpoint(url=url_path, method=invocation_path.method),
                              runtime=runtime_name,
                              status=deployment_status)

    @classmethod
    def container_name(cls, deployment_id: str):
        return f"{CONTAINER_PREFIX}-{deployment_id}"

    @classmethod
    def deployment_url_path_prefix(cls, deployment_id: str):
        return "/" + "/".join(s.strip("/") for s in [TRAEFIK_PATH_PREFIX, str(deployment_id)])
