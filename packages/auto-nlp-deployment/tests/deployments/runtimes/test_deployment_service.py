import dataclasses

import dramatiq
import pytest
from dramatiq import Message
from dramatiq.brokers.stub import StubBroker
from dramatiq.results import Results
from dramatiq.results.backends import StubBackend

broker = StubBroker()
broker.add_middleware(Results(backend=StubBackend()))
dramatiq.set_broker(broker)
broker.emit_after("process_boot")
broker.flush_all()

from deployments.entities import DeploymentStatus


@pytest.fixture()
def stub_broker():
    broker = StubBroker()
    broker.add_middleware(Results(backend=StubBackend()))
    dramatiq.set_broker(broker)
    broker.emit_after("process_boot")
    broker.flush_all()

    return broker


@pytest.fixture()
def pending_deployment():
    from deployments import DeploymentService
    from deployments.entities.pending_deployment import PendingDeployment
    import time

    msg: Message = Message(queue_name="test-queue",
                           actor_name="test-actor",
                           args=(),
                           kwargs={},
                           options={},
                           message_id="msg-id",
                           message_timestamp=int(time.time())
                           )

    return PendingDeployment(deployment_id=DeploymentService.create_deployment_id(),
                             runtime="test-runtime",
                             message=msg.encode()
                             )


def test_pending_deployment_dump(pending_deployment):
    from deployments.entities.pending_deployment import PendingDeployment
    json_data = pending_deployment.json()
    print(json_data)
    parsed = PendingDeployment.parse_raw(json_data)
    print(parsed)


def test_deployment_service(mocker, stub_broker, pending_deployment):
    from deployments import DeploymentService
    from deployments.entities import DeploymentTask

    mocker.patch('deployments.runtimes.deployment_runtime.DeploymentRuntime.deploy',
                 return_value=pending_deployment)

    deployment_service = DeploymentService()
    deployment_task = DeploymentTask(run_id="test-run", runtime="test-runtime",
                                     parameters={"test-parameter": "test-value"})

    deployment_info = deployment_service.deploy(deployment_task)
    print(deployment_info)

    assert deployment_service.get_deployment('test-runtime',
                                             deployment_info.deployment_id).status == DeploymentStatus.PENDING
