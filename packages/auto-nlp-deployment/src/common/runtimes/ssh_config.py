from pydantic import BaseModel


class SSHConfig(BaseModel):
    username: str
    host: str
    port: int
