import traceback
from typing import Any

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
from pydantic.fields import ModelField
from starlette.responses import PlainTextResponse
import main_dramatiq  # type: ignore

load_dotenv(find_dotenv(".env"), verbose=True)


def create_app():
    from trainings.runtimes.training_runtime_controller import router as training_runtime_router
    from trainings import training_controller
    from projects import project_controller
    from deployments import deployment_controller
    from models import model_controller
    from deployments.runtimes import deployment_runtime_controller

    app = FastAPI()
    app.include_router(project_controller.router)
    app.include_router(training_controller.router)
    app.include_router(model_controller.router)
    app.include_router(deployment_controller.router)
    app.include_router(training_runtime_router)
    app.include_router(deployment_runtime_controller.router)

    app.add_event_handler('startup', on_start_up)

    return app


def on_start_up():
    from trainings.runtimes.training_runtime_service import TrainingRuntimeService
    from docker_repositories import DockerRepositoryService
    from trainings import TrainingService

    DockerRepositoryService()
    TrainingRuntimeService()
    TrainingService()


def init_dramatiq():
    import dramatiq
    from dramatiq.brokers.rabbitmq import RabbitmqBroker
    from dramatiq.results.backends import RedisBackend
    from dramatiq.results import Results

    result_backend = RedisBackend()
    broker = RabbitmqBroker()
    broker.add_middleware(Results(backend=result_backend))
    dramatiq.set_broker(broker)
    dramatiq.get_broker().flush_all()


app = create_app()

# Meeting the monkey here ...
# Monkey patch to hide fields from schema as suggested in https://github.com/tiangolo/fastapi/issues/1378 ...
# TODO: Might be obsolete in future
from pydantic import schema


def field_schema(field: ModelField, **kwargs: Any) -> Any:
    if field.field_info.extra.get("hidden_from_schema", False):
        raise schema.SkipField(f"{field.name} field is being hidden")
    else:
        return original_field_schema(field, **kwargs)


original_field_schema = schema.field_schema
schema.field_schema = field_schema


# TODO Remove on production
@app.exception_handler(Exception)
async def http_exception_handler(request, exc: Exception):
    tb = ''.join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))
    return PlainTextResponse("Exception [%s]: %s\n%s" % (type(exc).__name__, str(exc), tb), status_code=500)
