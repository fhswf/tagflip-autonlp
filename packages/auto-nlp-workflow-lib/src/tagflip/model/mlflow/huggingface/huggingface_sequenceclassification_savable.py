import logging
from typing import Any, Dict, List, NewType

import mlflow
import numpy as np
import pandas as pd
import torch
import transformers
from mlflow.models import ModelSignature
from mlflow.pyfunc import PythonModel
from mlflow.types import ColSpec, DataType, Schema, TensorSpec
from mlflow.utils.environment import _mlflow_conda_env
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    pipeline
)

from tagflip.model.autonlp_arguments import AutoNLPArguments
from tagflip.model.mlflow.mlflow_savable import LogArgs, MLflowSavable, Name, Path

Model = NewType("Model", Any)
Tokenizer = NewType("Tokenizer", Any)
Config = NewType("Config", Any)

logger = logging.getLogger(__name__)

class HuggingFaceSequenceClassificationSavable(MLflowSavable):
    """
    Saves a NLP model for text classification that has been trained using Hugging Face Transformer API.
    """
    def __init__(self, trainer: Trainer, label_list: List[str]):
        """
        The constructor
        :param trainer: the Hugging Face Trainer being used to train the model
        :param label_list: the list of labels
        """
        self.trainer = trainer
        self.label_list = label_list

    def local_artifact_paths(self, autonlp_args: AutoNLPArguments) -> Dict[Name, Path]:
        model_identifier = autonlp_args.training_id

        logger.info("Saving model locally...")
        self.trainer.save_model(model_identifier)

        return {model_identifier: model_identifier}

    def log_args(self, _: AutoNLPArguments) -> LogArgs:
        conda_env = _mlflow_conda_env(
                additional_conda_deps=[],
                additional_pip_deps=[
                    "pandas~={}".format(pd.__version__),
                    "torch~={}".format(torch.__version__),
                    "transformers=={}".format(transformers.__version__),
                    "mlflow=={}".format(mlflow.__version__),
                ])

        return LogArgs(artifact_path="huggingface-pyfunc",
                       input_example=[
                           "This is some example sentence. Maybe a second sentence in same context.",
                           "This is some other sentence."
                       ],
                       signature=ModelSignature(
                               Schema([ColSpec(type=DataType.string)]),
                               Schema([TensorSpec(np.dtype('str'), (-1, -1, 2))])
                       ),
                       conda_env=conda_env
                       )

    def python_model(self, autonlp_args: AutoNLPArguments) -> PythonModel:
        model_identifier = autonlp_args.training_id
        return HuggingFaceSequenceClassificationSavable.create_python_model(model_identifier, self.label_list)

    @classmethod
    def create_python_model(cls, model_identifier, label_list):
        class SequenceClassificationPythonModel(PythonModel):
            def __init__(self):
                self.trained_model = None
                self.tokenizer = None
                self.label_list = None

            def load_context(self, context):
                model_artifact_path = context.artifacts[model_identifier]

                self.trained_model = AutoModelForSequenceClassification.from_pretrained(f"{model_artifact_path}")
                self.tokenizer = AutoTokenizer.from_pretrained(f"{model_artifact_path}")
                self.label_list = label_list

            def predict(self, context, input_df):
                sentences = input_df.values.tolist()
                sentences = list(map(lambda sentence: sentence[0], sentences))
                classifier = pipeline("text-classification", model=self.trained_model, tokenizer=self.tokenizer)
                pipe_sentences = []
                for pipe_out in pipe(KeyDataset(sentences, "text"), batch_size=8, truncation="only_first"):
                    pipe_sentences.append(pipe_out)
                return pipe_sentences

        return SequenceClassificationPythonModel()