import os
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ModelInfo(BaseModel):
    run_id: str

    creation_timestamp: datetime

    last_updated_timestamp: datetime

    description: str

    version: str

    source: str

    class Config:
        arbitrary_types_allowed = True
