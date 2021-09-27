from __future__ import annotations

import logging

from dramatiq import Message
from pydantic import BaseModel

logger = logging.getLogger("uvicorn")


class PendingDeployment(BaseModel):
    deployment_id: str

    runtime: str

    message: bytes

    @property
    def dramatiq_message(self) -> Message:
        return Message.decode(self.message)
