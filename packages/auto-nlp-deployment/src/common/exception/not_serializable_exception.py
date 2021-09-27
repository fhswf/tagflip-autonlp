from types import TracebackType

from typing import Optional


class NotSerializableException(RuntimeError):

    def __init__(self, *args: object) -> None:
        super().__init__(*args)
