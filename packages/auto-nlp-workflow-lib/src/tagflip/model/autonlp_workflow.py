from abc import ABC, abstractmethod
from typing import Any, Dict, NewType, Tuple, Type

from datasets import DatasetDict
from transformers import HfArgumentParser

from ..datasets import DatasetClient
from .autonlp_arguments import AutoNLPArguments
from .autonlp_workflow_exception import AutoNLPWorkflowException
from .mlflow.mlflow_savable import MLflowSavable

from datasets import load_dataset

CondaEnv = NewType("CondaEnv", Any)
DataClass = NewType("DataClass", Any)

Args = DataClass
ArgsType = Type[Args]
ArgsDataclasses = Tuple[ArgsType, ...]

HyperSpaceTuneArgs = Args
HyperSpaceTuneArgsType = ArgsType


class AutoNLPWorkflow(ABC):
    """
    This class defines the basic workflow for all training scripts that are being used inside TagFlip AutoNLP
    application. It is responsible for downloading the dataset from AutoNLP Core API and calls the lifecycle methods
    of the training.
    """

    def __init__(self, arg_dataclasses: ArgsDataclasses, hyperspace_tune_arg_class: HyperSpaceTuneArgsType = None):
        """
        The constructor.
        :param arg_dataclasses: The types of dataclasses the script wants the program's arguments to be parsed into.
        :param hyperspace_tune_arg_class: A certain dataclass that describes hyperparameter arguments
        """
        self._arg_dataclasses = arg_dataclasses
        self._hyperspace_tune_arg_class = hyperspace_tune_arg_class
        self._args: Dict[ArgsType, Args] = dict()
        self._hyperspace_tune_args: HyperSpaceTuneArgs = None
        self._autonlp_args: AutoNLPArguments = None

    def on_init(self, autonlp_args: AutoNLPArguments, args: Dict[ArgsType, Args],
                hyperspace_tune_args: HyperSpaceTuneArgsType = None):
        """
        Lifecycle method that will be called right after parsing the program arguments.
        :param autonlp_args: the arguments requested by the AutoNLP Workflow Library
        :param args: the script's arguments
        :param hyperspace_tune_args: the hyperparameter space
        """
        pass

    def load_dataset(self, dataset_name: str, subset_name: str, dataset_provider_name: str,
                     dataset_client: DatasetClient) -> DatasetDict:
        """
        Loads the dataset.
        :param dataset_name: the name of the dataset
        :param subset_name:  the name of selected subset
        :param dataset_provider_name: the dataset-provider's name
        :param dataset_client:  an instance of DatasetClient that is being connected to AutoNLP Core API and its dataset API.
        """
        if not dataset_provider_name:
            raise AutoNLPWorkflowException("Requiring a dataset_provider_name")
        if not dataset_name:
            raise AutoNLPWorkflowException("Requiring a dataset_name")
        if not subset_name:
            raise AutoNLPWorkflowException("Requiring a subset_name")
        try:
            datasets = dataset_client.load_dataset(dataset_name, subset_name, dataset_provider_name)
        except Exception as e:
            raise AutoNLPWorkflowException(f"Could not load dateset " + str(e))
        if not datasets:
            raise AutoNLPWorkflowException("Dataset is undefined")
        if not any(k in datasets for k in ('valid', 'validation')) \
                or ('valid' in datasets and len(datasets['valid']) == 0) \
                or ('validation' in datasets and len(datasets['validation']) == 0):
            if 'test' not in datasets \
                    or ('test' in datasets and len(datasets['test']) == 0):
                valid, test, train = dataset_client.load_dataset(dataset_name, subset_name, dataset_provider_name,
                                                                 split=['train[:15%]', 'train[15%:30%]',
                                                                        'train[-70%:]'])
            else:
                valid, test, train = dataset_client.load_dataset(dataset_name, subset_name, dataset_provider_name,
                                                                 split=['train[:15%]', 'test', 'train[-85%:]'])

            datasets['train'] = train
            datasets['validation'] = valid
            datasets['test'] = test

        return datasets

    @abstractmethod
    def before_train(self, datasets: DatasetDict, autonlp_args: AutoNLPArguments, args: Dict[ArgsType, Args],
                     hyperspace_tune_args: HyperSpaceTuneArgs = None):
        """
        Lifecycle method that will be called right before starting the training.
        :param datasets: the dataset in Hugging Face dataset format
        :param autonlp_args: the arguments requested by the AutoNLP Workflow Library
        :param args: the script's arguments
        :param hyperspace_tune_args: the hyperparameter space
        """
        raise NotImplementedError("Method before_train not implemented!")

    @abstractmethod
    def train(self, datasets: DatasetDict, autonlp_args: AutoNLPArguments, args: Dict[ArgsType, Args],
              hyperspace_tune_args: HyperSpaceTuneArgs = None) -> MLflowSavable:
        """
        Lifecycle method that is responsible for training an NLP model.
        :param datasets: the dataset in Hugging Face dataset format
        :param autonlp_args: the arguments requested by the AutoNLP Workflow Library
        :param args: the script's arguments
        :param hyperspace_tune_args: the hyperparameter space
        :return an instance of MLflowSavable that defines how to save the trained model to TagFlip AutoNLP infrastructure.
        """
        raise NotImplementedError("Method train not implemented!")

    @property
    def args(self) -> Dict[ArgsType, Args]:
        """
        Gets the script's arguments.
        :return: the arguments
        """
        return self._args

    @args.setter
    def args(self, value):
        """
        Sets the script's arguments.
        """
        self._args = value

    @property
    def autonlp_args(self) -> AutoNLPArguments:
        """
        Gets the arguments requested by the AutoNLP Workflow Library.
        :return: the arguments
        """
        return self._autonlp_args

    @property
    def hyperspace_tune_args(self) -> HyperSpaceTuneArgs:
        """
        Gets the the hyperparameter space.
        :return: the hyperparameter space
        """
        return self._hyperspace_tune_args

    @hyperspace_tune_args.setter
    def hyperspace_tune_args(self, value):
        """
        Sets the the hyperparameter space.
        """
        self._hyperspace_tune_args = value

    def run(self):
        """
        Performs the training lifecylce.
        """
        parser = HfArgumentParser([AutoNLPArguments] + list(self._arg_dataclasses))
        parsed_args = parser.parse_args_into_dataclasses(return_remaining_strings=True)
        self._autonlp_args = parsed_args[0]
        script_args = parsed_args[1:-1]

        for idx, clazz in enumerate(self._arg_dataclasses):
            self._args[clazz] = script_args[idx]

        self.hyperspace_tune_args = None
        if self.autonlp_args.search_hyperparams and self._hyperspace_tune_arg_class:
            self.hyperspace_tune_args = \
                HfArgumentParser(self._hyperspace_tune_arg_class).parse_args_into_dataclasses(parsed_args[-1])[0]

        dataset_client = DatasetClient(self.autonlp_args.tagflip_host)

        self.on_init(self.autonlp_args, self.args, self.hyperspace_tune_args)
        datasets = self.load_dataset(dataset_name=self.autonlp_args.dataset_name,
                                     subset_name=self.autonlp_args.subset_name,
                                     dataset_provider_name=self.autonlp_args.dataset_provider_name,
                                     dataset_client=dataset_client)
        self.before_train(datasets, self.autonlp_args, self.args, self.hyperspace_tune_args)
        savable = self.train(datasets, self.autonlp_args, self.args, self.hyperspace_tune_args)
        savable.save_model(self.autonlp_args)  # save model
