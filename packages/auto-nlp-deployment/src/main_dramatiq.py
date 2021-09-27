import logging

import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.middleware import CurrentMessage
from dramatiq.results import Results, backends as result_backends
from dramatiq_abort import Abortable, backends as abort_backends

from common.redis import create_redis_client

logger = logging.getLogger("uvicorn")


def init_dramatiq():
    logger.info("Initializing dramatiq")
    redis_client = create_redis_client()

    broker = RedisBroker(client=redis_client)
    broker.add_middleware(Results(backend=result_backends.RedisBackend(client=redis_client)))
    broker.add_middleware(Abortable(backend=abort_backends.RedisBackend(client=redis_client)))
    broker.add_middleware(CurrentMessage())

    dramatiq.set_broker(broker)


init_dramatiq()

# Add modules containing actors
from deployments.runtimes.docker.docker_deployment_actor import DockerDeploymentActor  # noqa
from trainings.runtimes.docker.docker_training_actor import DockerTrainingActor  # noqa
