import logging
import os

import yaml

from util import get_app_root

logger = logging.getLogger("uvicorn")


def load_config():
    config_folder = os.path.join(get_app_root(), 'config')
    mode = os.getenv("PYTHON_ENV")
    logger.info("Reading runtime configuration")
    runtimes_config_file = os.path.join(config_folder, f"config.{mode}.yaml")
    if not os.path.isfile(runtimes_config_file):
        raise RuntimeError(
                "Configuration not found in path " + os.path.abspath(runtimes_config_file))
    with open(runtimes_config_file, 'r') as stream:
        data = yaml.safe_load(stream)

    return data


app_config = load_config()
