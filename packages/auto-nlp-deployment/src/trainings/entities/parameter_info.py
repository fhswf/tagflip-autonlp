from typing import Any, Dict

from pydantic import BaseModel


class ParameterInfo(BaseModel):
    run_id: str

    parameters: Dict[str, Any]
