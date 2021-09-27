from __future__ import annotations

from enum import Enum


class DeploymentStatus(str, Enum):
    PENDING = "PENDING"
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
