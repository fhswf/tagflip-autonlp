from typing import Optional

from pydantic import BaseModel

from .run_status import RunStatus


class RunInfo(BaseModel):
    run_id: str

    dashboard_url: Optional[str]

    status: RunStatus

    class Config:
        arbitrary_types_allowed = True
