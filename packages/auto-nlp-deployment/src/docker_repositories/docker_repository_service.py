import logging
import os
import yaml
from pydantic import parse_obj_as
from typing import Dict

from .docker_repository_config import DockerRepositoryConfig
from .docker_repository import DockerRepository

from util import Singleton, get_app_root

logger = logging.getLogger("uvicorn")


class DockerRepositoryService(Singleton):

    def _init(self, *args, **kwds):
        from config import app_config
        self._repositories: Dict[str, DockerRepository] = dict()
        if 'docker-registries' in app_config:
            repo_config = app_config['docker-registries'] if app_config['docker-registries'] else []
            for repo_config_dict in repo_config:
                docker_config: DockerRepositoryConfig = parse_obj_as(DockerRepositoryConfig, repo_config_dict)
                if docker_config.name in self._repositories:
                    raise ValueError(f"Docker repository for name {docker_config.name} already defined.")
                docker_runtime = DockerRepository(docker_config)
                self._repositories[docker_config.name] = docker_runtime

    def get_repository(self, name: str) -> DockerRepository:
        if name not in self._repositories:
            raise ValueError(f"No repository found for name {name}")
        return self._repositories[name]
