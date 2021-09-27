from fastapi import HTTPException
from starlette import status
from typing import Any


class SSHForbiddenException(HTTPException):
    def __init__(self, detail: Any = None):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
