from starlette import status
from typing import Any

from fastapi import HTTPException


class TrainingNotFoundException(HTTPException):
    def __init__(self, detail: Any = None):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
