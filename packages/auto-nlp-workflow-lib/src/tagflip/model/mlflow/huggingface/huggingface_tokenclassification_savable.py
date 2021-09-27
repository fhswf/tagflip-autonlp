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
    AutoModelForTokenClassification,
    AutoTokenizer,
    Trainer,
)

from tagflip.model.autonlp_arguments import AutoNLPArguments
from tagflip.model.mlflow.mlflow_savable import LogArgs, MLflowSavable, Name, Path

Model = NewType("Model", Any)
Tokenizer = NewType("Tokenizer", Any)
Config = NewType("Config", Any)

logger = logging.getLogger(__name__)


class HuggingFaceTokenClassificationSavable(MLflowSavable):
    """
    Saves a NLP model for token classification that has been trained using Hugging Face Transformer API.
    """

    def __init__(self, trainer: Trainer, label_list: List[str]):
        """
        The constructor
        :param trainer: the Hugging Face Trainer being used to train the model
        :param label_list: the list of class-labels
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
                    "seqeval~=1.2",
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
        return HuggingFaceTokenClassificationSavable.create_python_model(model_identifier, self.label_list)

    @classmethod
    def create_python_model(cls, model_identifier, label_list):
        class TokenClassificationPythonModel(PythonModel):
            def __init__(self):
                self.trained_model = None
                self.tokenizer = None
                self.label_list = None

            def load_context(self, context):
                model_artifact_path = context.artifacts[model_identifier]

                self.trained_model = AutoModelForTokenClassification.from_pretrained(f"{model_artifact_path}")
                self.tokenizer = AutoTokenizer.from_pretrained(f"{model_artifact_path}")
                self.label_list = label_list

            def predict(self, context, input_df):
                sentences = input_df.values.tolist()
                sentences = list(map(lambda sentence: sentence[0], sentences))
                encoded_sentences = self.tokenizer.batch_decode(
                        self.tokenizer.batch_encode_plus(sentences, padding=True, truncation=True)['input_ids'])
                encoded_sentences_df = pd.DataFrame(encoded_sentences)
                token_df = encoded_sentences_df.applymap(lambda x: self.tokenizer.tokenize(x))

                inputs = self.tokenizer.batch_encode_plus(sentences, padding=True, truncation=True, return_tensors="pt")
                outputs = self.trained_model(**inputs).logits
                predictions = torch.argmax(outputs, dim=2)

                out_sentences = []
                for sentence_tokens, sentence_predictions in zip(token_df[0], predictions):
                    out_sentences.append(np.array(
                            [(token, (label_list[label_id] if label_id >= 0 else '[IGNORE]')) for (token, label_id) in
                             zip(sentence_tokens, sentence_predictions)]))
                return np.array(out_sentences)

        return TokenClassificationPythonModel()
