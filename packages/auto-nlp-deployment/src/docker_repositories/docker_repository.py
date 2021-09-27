import urllib.parse

import util.docker
from docker_repositories.docker_repository_config import DockerRepositoryConfig


class DockerRepository(object):

    def __init__(self, config: DockerRepositoryConfig):
        super().__init__()
        self._config = config
        if not util.docker.registry_login(config.url,
                                          config.username,
                                          config.password):
            raise RuntimeError("Could not authenticate docker to registry.")

        self._parsed_docker_registry_url = urllib.parse.urlparse(config.url)

    @property
    def config(self):
        return self._config

    @property
    def hostname(self):
        return self._parsed_docker_registry_url.hostname

    def login(self):
        util.docker.registry_login(self._config.url, self._config.username, self._config.password)

    def image_name_for_project(self, project_name: str):
        return self.hostname + "/" + project_name.lower().replace("_", "-").replace(".", "-")
