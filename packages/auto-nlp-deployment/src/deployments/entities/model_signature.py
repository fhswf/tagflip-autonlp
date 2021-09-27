from typing import Any, Optional

from pydantic import BaseModel


class ModelSignature(BaseModel):
    input: Optional[Any]
    output: Optional[Any]