from __future__ import annotations

from enum import Enum

from mlflow.entities import RunStatus as MLFlowRunStatus


class RunStatus(str, Enum):
    RUNNING = MLFlowRunStatus.to_string(MLFlowRunStatus.RUNNING)
    FINISHED = MLFlowRunStatus.to_string(MLFlowRunStatus.FINISHED)
    SCHEDULED = MLFlowRunStatus.to_string(MLFlowRunStatus.SCHEDULED)
    FAILED = MLFlowRunStatus.to_string(MLFlowRunStatus.FAILED)
    KILLED = MLFlowRunStatus.to_string(MLFlowRunStatus.KILLED)

    @classmethod
    def to_mlflow_state(cls, status: RunStatus) -> MLFlowRunStatus:
        return MLFlowRunStatus.from_string(status)

    @classmethod
    def from_mlflow_state(cls, status: MLFlowRunStatus) -> MLFlowRunStatus:
        ml_status_string = MLFlowRunStatus.to_string(status)
        if ml_status_string not in cls._value2member_map_:
            raise ValueError("MLFlow Status " + ml_status_string + " is an unknown RunState")
        return RunStatus[ml_status_string]

