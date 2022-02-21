import logging
import signal
from abc import ABC
from typing import Any, Dict, NewType
from typing_extensions import final

import mlflow
from datasets import DatasetDict
from transformers import (TrainerCallback, TrainerControl, TrainerState, TrainingArguments)

from ....model import AutoNLPArguments
from ....model.autonlp_workflow import Args, ArgsDataclasses, ArgsType, AutoNLPWorkflow, HyperSpaceTuneArgs, \
    HyperSpaceTuneArgsType

Model = NewType("Model", Any)
Tokenizer = NewType("Tokenizer", Any)
Config = NewType("Config", Any)

logger = logging.getLogger(__name__)


class HuggingFaceWorkflow(AutoNLPWorkflow, ABC):
    """
    A AutoNLPWorkflow enhanced with capabilities for HuggingFace NLP Framework.
    """

    def __init__(self, arg_dataclasses: ArgsDataclasses, hyperspace_tune_arg_class: HyperSpaceTuneArgsType = None):
        super().__init__(arg_dataclasses, hyperspace_tune_arg_class)

    @final
    def before_train(self, datasets: DatasetDict, autonlp_args: AutoNLPArguments, args: Dict[ArgsType, Args],
                     hyperspace_tune_args: HyperSpaceTuneArgs = None):
        if TrainingArguments not in args:
            raise RuntimeError("No TrainingArguments defined for TagFlipHuggingFaceWorkflow")

        # enhance HF TrainingArguments with mlflow logging
        training_arguments = args[TrainingArguments]
        training_arguments.report_to = ['mlflow'] + [x for x in training_arguments.report_to if x != 'mlflow']
        args[TrainingArguments] = training_arguments

    def get_hf_tagflip_trainer_callback(self):
        """
        Returns a TrainerCallback for HuggingFace Trainer that applies workflow relevant capabilities to the Trainer
        :return: a TrainerCallback for HuggingFace Trainer
        """
        return HuggingFaceWorkflow.HuggingFaceCallback(self.autonlp_args)

    def log_metrics(self, metrics: Dict[str, any], step: int = None):
        """
        Logs metrics to MLflow
        :param metrics: the metrics
        :param step: the global step the metrics belong to
        """
        mlflow.log_metrics(metrics, step)

    class HuggingFaceCallback(TrainerCallback):
        """
        This Hugging Face TrainerCallback stops training if global variable 'interrupted' is True and
        sets AutoNLP Workflow specific tags.
        """

        def __init__(self, autonlp_args: AutoNLPArguments):
            self.interrupted = False
            self.autonlp_args = autonlp_args
            signal.signal(signal.SIGINT, self._handle_interrupt)
            mlflow.set_experiment(self.autonlp_args.project_id)

        def on_train_begin(self, args: TrainingArguments, state: TrainerState, control: TrainerControl, **kwargs):
            mlflow.set_tag('training_id', self.autonlp_args.training_id)
            mlflow.set_tag('project_id', self.autonlp_args.project_id)
            mlflow.set_tag('dataset_name', self.autonlp_args.dataset_name)
            mlflow.set_tag('subset_name', self.autonlp_args.subset_name)
            mlflow.set_tag('dataset_provider_name', self.autonlp_args.dataset_provider_name)

        def on_step_end(self, args: TrainingArguments, state: TrainerState, control: TrainerControl, **kwargs):
            logger.info("Training will stop.")
            control.should_training_stop = self.interrupted

        def _handle_interrupt(self, signum, frame):
            self.interrupted = True
            logger.info("Interrupted.")
