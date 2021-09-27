import sys

import os

from pathlib import Path


def get_app_root() -> Path:
    return os.path.abspath(Path(__file__).parent.parent.parent)
