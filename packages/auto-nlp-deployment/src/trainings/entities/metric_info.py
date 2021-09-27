from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

MetricDataType = float


class MetricStep(BaseModel):
    step: int

    timestamp: datetime

    value: MetricDataType


class MetricInfo(BaseModel):
    run_id: str

    name: str

    last_value: MetricDataType

    steps: Optional[List[MetricStep]]
