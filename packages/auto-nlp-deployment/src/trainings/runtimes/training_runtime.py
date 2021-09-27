from __future__ import annotations

import asyncio
import logging
from abc import abstractmethod
from typing import Dict, Generic, Type, TypeVar, final

from dramatiq import Message

from common.runtimes import Runtime, RuntimeConfig
from trainings.entities.pending_run import PendingRun
from trainings.entities.training_task import TrainingTask
from trainings.training_actor import TrainingActor, TrainingDescription

logger = logging.getLogger("uvicorn")

RunType = TypeVar('RunType')
ConfigType = TypeVar('ConfigType', bound=RuntimeConfig)
TrainingTaskType = TypeVar('TrainingTaskType', bound=TrainingTask)

loop = asyncio.get_event_loop()


class TrainingRuntime(Runtime, Generic[ConfigType]):
    _known_environments: Dict[str, Type[TrainingRuntime]] = {}

    def __init__(self, config: ConfigType):
        super().__init__(config)

    @classmethod
    def type(cls, name: str):
        """
        Indicates for which training runtime env type the class is responsible.
        :param name: the dataset type
        """

        def decorator(clazz):
            if clazz not in TrainingRuntime._known_environments:
                TrainingRuntime._known_environments[name] = clazz

        return decorator

    @classmethod
    def get_known_environments(cls) -> Dict[str, Type[TrainingRuntime]]:
        """
        Returns a dictionary of the known environments.
        :return: Dictionary of the known environments.
        """
        return cls._known_environments

    @final
    def enqueue_training(self, training_task: TrainingTask) -> PendingRun:
        actor: Type[TrainingActor] = self.training_actor()
        training_description = TrainingDescription(
                project_id=training_task.project_id,
                script_url=training_task.script_url,
                script_parameters=training_task.parameters,
                runtime_parameters=training_task.runtime_parameters,
                runtime_config=self.config.dict(),
                env_vars=self.environment()
        )
        logger.info(f"Enqueueing training task for actor {actor.__name__}")

        message: Message = actor.send(training_description.json())
        return PendingRun(training_id=training_task.training_id, message_id=message.message_id,
                          message=message.encode())

    @abstractmethod
    def training_actor(self) -> Type[TrainingActor]:
        raise NotImplementedError()

    # async def deploy_training(self, training_task: TrainingTaskType) -> ActiveRun[Any]:
    #     tmp_dir = tempfile.mkdtemp(prefix="tagflip-")
    #
    #     if os.path.exists(training_task.script_url):
    #         # script is local
    #         script_location = training_task.script_url
    #     else:
    #         logger.info(f"Created temp directory {tmp_dir}")
    #         script_location = await self._script_as_local_script(training_task, tmp_dir)
    #
    #     training_task.local_script_location = script_location
    #     run = await self._do_deploy_training(training_task, tmp_dir)
    #     logger.info(f"Adding cleanup callback for temp dir {tmp_dir}")
    #     run.attach_callback(TrainingRuntime.CleanUpCallback(tmp_dir))
    #
    #     return run
    #
    # @abstractmethod
    # async def _do_deploy_training(self, training_task: TrainingTaskType, temporary_run_directory: str) \
    #         -> ActiveRun[Any]:
    #     raise NotImplementedError()
    #
    # @staticmethod
    # async def _script_as_local_script(training_task: TrainingTaskType, target_dir):
    #     if os.path.exists(training_task.script_url):
    #         # script is local
    #         return training_task.script_url
    #     if util.git.is_git_repo(training_task.script_url):
    #         target_dir = await util.git.clone_or_pull_resolve_subdir(training_task.script_url, target_dir)
    #         return target_dir
    #     download(training_task.script_url, target_dir)
    #     return target_dir
    #
    # class CleanUpCallback(RunCallback):
    #
    #     def __init__(self, tmp_dir):
    #         self.tmp_dir = tmp_dir
    #
    #     def on_stop(self, run: ActiveRun):
    #         logger.info(f"Cleaning up temp directory {self.tmp_dir}")
    #         shutil.rmtree(self.tmp_dir)
