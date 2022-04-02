import logging
import os
from dataclasses import dataclass, field
from glob import glob
from typing import Dict, Optional, Tuple

import numpy as np
import sys
import transformers
from datasets import ClassLabel, DatasetDict, load_metric
from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    PreTrainedTokenizerFast,
    Trainer,
    TrainingArguments,
    set_seed
)
from transformers.trainer_utils import is_main_process

# Will error if the minimal version of Transformers is not installed. Remove at your own risks.
from tagflip.model import AutoNLPArguments
from tagflip.model.autonlp_workflow import Args, ArgsType

from tagflip.model.mlflow.huggingface import HuggingFaceSequenceClassificationSavable, HuggingFaceWorkflow

logger = logging.getLogger(__name__)


@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune from.
    """
    model_name: str = field(
        metadata={
            "help": "Name of pretrained model or model identifier from huggingface.co/models"},
    )
    config_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained config name or path if not the same as model_name"}
    )
    tokenizer_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained tokenizer name or path if not the same as model_name"}
    )
    model_revision: str = field(
        default="main",
        metadata={
            "help": "The specific model version to use (can be a branch name, tag name or commit id)."},
    )
    use_auth_token: bool = field(
        default=False,
        metadata={
            "help": "Will use the token generated when running `transformers-cli login` (necessary to use this script "
            "with private models)."
        },
    )


@dataclass
class DataTrainingArguments:
    """
    Arguments pertaining to what data we are going to input our model for training and eval.
    """
    task_name: Optional[str] = field(
        default="sc", metadata={"help": "The name of the task (ner, pos...)."})
    pad_to_max_length: bool = field(
        default=False,
        metadata={
            "help": "Whether to pad all samples to model maximum sentence length. "
            "If False, will pad the samples dynamically when batching to the maximum length in the batch. More "
            "efficient on GPU but very bad for TPU."
        },
    )
    max_train_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": "For debugging purposes or quicker training, truncate the number of training examples to this "
            "value if set."
        },
    )
    max_val_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": "For debugging purposes or quicker training, truncate the number of validation examples to this "
            "value if set."
        },
    )
    max_test_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": "For debugging purposes or quicker training, truncate the number of test examples to this "
            "value if set."
        },
    )
    return_entity_level_metrics: bool = field(
        default=False,
        metadata={
            "help": "Whether to return all the entity levels during evaluation or just the overall ones."},
    )

    def __post_init__(self):
        self.task_name = self.task_name.lower()


@dataclass
class HyperSpaceTuneArgs:
    trials: int = field(default=1, metadata={
                        "help": "The number of trials that should be performed."})
    learning_rate_min_max: Tuple[float, float] = field(default=(1e-6, 1e-4), metadata={
        "help": "The minimum and maximum value to sample from uniform distribution of given ranges"})

    max_num_train_epochs: int = field(
        default=1, metadata={"help": "The maximum number of train epochs"})

    seed_max: int = field(default=40, metadata={
        "help": "The maximum value to sample from uniform distribution of range [1,seed_max]"})

    possible_train_batch_sizes: Tuple[int] = field(default=(2, 4), metadata={
        "help": "Possible batch sizes to choose from."})


class HFGenericSequenceClassificationWorkflow(HuggingFaceWorkflow):

    def __init__(self):
        super().__init__((TrainingArguments, ModelArguments,
                          DataTrainingArguments), HyperSpaceTuneArgs)

    def train(self, datasets: DatasetDict, autonlp_args: AutoNLPArguments, args: Dict[ArgsType, Args],
              hyperspace_tune_args: HyperSpaceTuneArgs = None):
        training_args = args[TrainingArguments]
        model_args = args[ModelArguments]
        data_args = args[DataTrainingArguments]
        train_dataset = datasets['train']
        valid_dataset = datasets['validation']
        test_dataset = datasets['test']

        # Setup logging
        logging.basicConfig(format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
                            datefmt="%m/%d/%Y %H:%M:%S",
                            handlers=[logging.StreamHandler(sys.stdout)])
        logger.setLevel(logging.INFO if is_main_process(
            training_args.local_rank) else logging.WARN)

        # Log on each process the small summary:
        logger.warning(
            f"Process rank: {training_args.local_rank}, device: {training_args.device}, n_gpu: {training_args.n_gpu}"
            + f"distributed training: {bool(training_args.local_rank != -1)}, 16-bits training: {training_args.fp16}"
        )
        # Set the verbosity to info of the Transformers logger (on main process only):
        if is_main_process(training_args.local_rank):
            transformers.utils.logging.set_verbosity_info()
            transformers.utils.logging.enable_default_handler()
            transformers.utils.logging.enable_explicit_format()
        logger.info(f"Training/evaluation parameters {training_args}")

        # Set seed before initializing model.
        set_seed(training_args.seed)

        # get column names
        column_names = train_dataset.column_names
        features = train_dataset.features

        text_column_name = "text" if "text" in column_names else column_names[0]
        label_column_name = "label" if "label" in column_names else column_names[1]

        # In the event the labels are not a `Sequence[ClassLabel]`, we will need to go through the dataset to get the
        # unique labels.
        def get_label_list(labels):
            unique_labels = set()
            for label in labels:
                unique_labels = unique_labels | set(label)
            label_list = list(unique_labels)
            label_list.sort()
            return label_list

        if isinstance(features[label_column_name], ClassLabel):
            label_list = features[label_column_name].names
        else:
            label_list = get_label_list(features[label_column_name])

        num_labels = len(label_list)

        # Load pretrained model and tokenizer
        #
        # Distributed training:
        # The .from_pretrained methods guarantee that only one local process can concurrently
        # download model & vocab.
        config = AutoConfig.from_pretrained(
            model_args.config_name if model_args.config_name else model_args.model_name,
            num_labels=num_labels,
            finetuning_task=data_args.task_name,
            revision=model_args.model_revision,
            use_auth_token=True if model_args.use_auth_token else None,
        )
        tokenizer = AutoTokenizer.from_pretrained(
            model_args.tokenizer_name if model_args.tokenizer_name else model_args.model_name,
            use_fast=True,
            revision=model_args.model_revision,
            use_auth_token=True if model_args.use_auth_token else None
        )

        def model_init():
            return AutoModelForSequenceClassification.from_pretrained(
                model_args.model_name,
                config=config,
                revision=model_args.model_revision,
                use_auth_token=True if model_args.use_auth_token else None
            )

        # Tokenizer check: this script requires a fast tokenizer.
        if not isinstance(tokenizer, PreTrainedTokenizerFast):
            raise ValueError(
                "This script only works for models that have a fast tokenizer. Checkout the big table of models "
                "at https://huggingface.co/transformers/index.html#bigtable to find the model types that meet this "
                "requirement"
            )

        # Preprocessing the dataset
        # Padding strategy
        padding = "max_length" if data_args.pad_to_max_length else False

        # Tokenize text
        def tokenized_data(examples):
            tokenized_datasets = tokenizer(
                examples[text_column_name],
                padding=padding,  # whether to pad to max seq length or not
                truncation=True
            )
            return tokenized_datasets

        if data_args.max_train_samples is not None:
            train_dataset = train_dataset.select(
                range(data_args.max_train_samples))
        train_dataset = train_dataset.map(tokenized_data, batched=True)

        if data_args.max_val_samples is not None:
            valid_dataset = valid_dataset.select(
                range(data_args.max_val_samples))
        valid_dataset = valid_dataset.map(tokenized_data, batched=True)

        test_dataset = test_dataset.map(tokenized_data, batched=True)

        # Data collator
        data_collator = DataCollatorWithPadding(
            tokenizer, pad_to_multiple_of=8 if training_args.fp16 else None)

        # Metrics
        metrics_list = ['accuracy', 'f1', 'precision', 'recall']
        metric = {}
        for i, index in enumerate(metrics_list):
            metric[i] = load_metric(f"{index}")

        def compute_metrics(p):
            predictions, labels = p
            predictions = np.argmax(predictions, axis=-1)
            final_results = {}
            for i in range(len(metrics_list)):
                results = metric[i].compute(
                    predictions=predictions, references=labels)
                for key, value in results.items():
                    if isinstance(value, dict):
                        for n, v in value.items():
                            final_results[f"{key}_{n}"] = v
                    else:
                        final_results[key] = value
            return final_results

        trainer = Trainer(
            model_init=model_init,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=valid_dataset,
            tokenizer=tokenizer,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
        )
        # this is important to attach tagflip capabilities
        trainer.add_callback(self.get_hf_tagflip_trainer_callback())

        logger.info("*** Evaluate untrained ***")
        metrics = trainer.evaluate()
        max_test_samples = data_args.max_test_samples if data_args.max_test_samples is not None else len(
            valid_dataset)
        metrics["eval_samples"] = min(max_test_samples, len(valid_dataset))
        trainer.log_metrics("eval", metrics)
        self.log_metrics(metrics)

        if hyperspace_tune_args:
            def hp_space_fn(trial) -> Dict[str, float]:
                return {
                    "learning_rate": trial.suggest_float("learning_rate", hyperspace_tune_args.learning_rate_min_max[0],
                                                         hyperspace_tune_args.learning_rate_min_max[1], log=True),
                    "num_train_epochs": trial.suggest_int("num_train_epochs", 1,
                                                          hyperspace_tune_args.max_num_train_epochs),
                    "seed": trial.suggest_int("seed", 1, hyperspace_tune_args.seed_max),
                    "per_device_train_batch_size": trial.suggest_categorical("per_device_train_batch_size", list(
                        hyperspace_tune_args.possible_train_batch_sizes)),
                }

            logger.info(
                f"Starting training with automatic hyperparameter search. There will be {hyperspace_tune_args.trials} trials.")
            best_run = trainer.hyperparameter_search(hp_space_fn, backend="optuna",
                                                     compute_objective=lambda x: x['eval_f1'],
                                                     direction="maximize",
                                                     n_trials=hyperspace_tune_args.trials)
            model_dir = os.path.join(
                training_args.output_dir, f"run-{best_run.run_id}")
            logger.info(f"Loading best model from {model_dir}.")
            last_checkpoint_dir = sorted(
                glob(os.path.join(model_dir, "*", "")))[-1]
            model = AutoModelForSequenceClassification.from_pretrained(
                last_checkpoint_dir)
            tmp_trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=valid_dataset,
                tokenizer=tokenizer,
                data_collator=data_collator,
                compute_metrics=compute_metrics,
            )
            # this is important to attach tagflip capabilities
            tmp_trainer.add_callback(self.get_hf_tagflip_trainer_callback())
            logger.info("*** Evaluate best found model ***")
            metrics = tmp_trainer.evaluate()
            max_test_samples = data_args.max_test_samples if data_args.max_test_samples is not None else len(
                valid_dataset)
            metrics["eval_samples"] = min(max_test_samples, len(valid_dataset))
            tmp_trainer.log_metrics("eval", metrics)
            self.log_metrics(metrics)

            # Test
            logger.info("*** Predict ***")
            metrics = tmp_trainer.predict(test_dataset)[2]
            tmp_trainer.log_metrics("test", metrics)
            self.log_metrics(metrics)

            return HuggingFaceSequenceClassificationSavable(trainer=tmp_trainer, label_list=label_list)
        else:
            # Training
            logger.info("Starting training")
            train_result = trainer.train()
            metrics = train_result.metrics
            max_train_samples = (
                data_args.max_train_samples if data_args.max_train_samples is not None else len(
                    train_dataset)
            )
            metrics["train_samples"] = min(
                max_train_samples, len(train_dataset))
            trainer.log_metrics("train", metrics)
            self.log_metrics(metrics)
            trainer.save_state()

            # Test
            logger.info("*** Predict ***")
            metrics = trainer.predict(test_dataset)[2]
            trainer.log_metrics("test", metrics)
            self.log_metrics(metrics)

            return HuggingFaceSequenceClassificationSavable(trainer=trainer, label_list=label_list)


def _mp_fn(index):
    # For xla_spawn (TPUs)
    HFGenericSequenceClassificationWorkflow().run()


if __name__ == '__main__':
    HFGenericSequenceClassificationWorkflow().run()
