import logging
import traceback

from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI
from starlette.responses import PlainTextResponse

from controllers import datasets_controller
from services import DatasetSearchService

env_file = find_dotenv()
load_dotenv(env_file, verbose=True)

logger = logging.getLogger("uvicorn")


def create_app():
    app = FastAPI()
    app.include_router(datasets_controller.router)
    app.add_event_handler('startup', lambda: DatasetSearchService())

    return app


app = create_app()


# TODO Remove on production
@app.exception_handler(Exception)
async def http_exception_handler(request, exc: Exception):
    tb = ''.join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))
    return PlainTextResponse("Exception [%s]: %s\n%s" % (type(exc).__name__, str(exc), tb), status_code=500)
