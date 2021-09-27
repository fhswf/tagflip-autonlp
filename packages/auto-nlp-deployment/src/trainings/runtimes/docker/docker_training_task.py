from pydantic import BaseModel, Field

from trainings.entities.training_task import TrainingTask


class DockerRuntimeParameters(BaseModel):
    gpu_id: int = Field(default=None, description="The device ids of GPUs which should be available in the container.")


class DockerTrainingTask(TrainingTask[DockerRuntimeParameters]):
    pass
