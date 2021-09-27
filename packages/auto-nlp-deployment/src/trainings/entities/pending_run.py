from __future__ import annotations

import logging

from dramatiq import Message
from pydantic import BaseModel, Field

logger = logging.getLogger("uvicorn")


class PendingRunInfo(BaseModel):
    message_id: str

    training_id: str


class PendingRun(PendingRunInfo):
    message: bytes = Field(None, hidden_from_schema=True)

    @property
    def dramatiq_message(self) -> Message:
        return Message.decode(self.message)
