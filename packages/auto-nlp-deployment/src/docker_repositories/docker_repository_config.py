from pydantic import BaseModel, BaseSettings, Field


class DockerRepositoryConfig(BaseSettings):
    name: str = Field(
        None, description="Name of the docker repository config.")
    url: str = Field(None, description="Url to the docker repository.")
    username: str = Field(
        None, description="Username for login to docker repository.")
    password: str = Field(
        None, description="Password for login to docker repository.", env="DOCKER_PASSWORD")
