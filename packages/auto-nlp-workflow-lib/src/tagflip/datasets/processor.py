from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict

from datasets import Dataset, DatasetDict

from .dataset_description import ProvidedDataset


class Processor(ABC):
    """
    A Processor is an abstract class whose implementations take responsibility for providing a dataset described
    by AutoNLP Core dataset API as Hugging Face compatible dataset.
    """
    _known_processors: Dict[str, Processor] = {}

    @classmethod
    def _register_internal_processor(cls, name, constructor):
        if constructor not in Processor._known_processors:
            Processor._known_processors[name] = constructor()

    @classmethod
    def type(cls, name: str):
        """
        Indicates for which dataset-provider type the class is responsible for.
        :param name: the dataset-provider type
        """

        def decorator(clazz):
            Processor._register_internal_processor(name, clazz)

        return decorator

    @abstractmethod
    def get_dataset(self, dataset_description: ProvidedDataset, subset_name: str = None, split: Any = None) \
            -> [DatasetDict, Dataset]:
        """
        The method returns a Huggingface compatible dataset for the dataset described by TagFlip Auto-NLP.
        :param dataset_description: The AutoNLP Core dataset API's description of the dataset.
        :param subset_name: The name of the subset to be selected
        :param split: The desired split as defined in https://huggingface.co/docs/datasets/splits.html#.
        :return: The Hugging Face Dataset
        """
        raise NotImplemented("get_dataset() not implemented.")

    @classmethod
    def get_known_processors(cls) -> Dict[str, Processor]:
        """
        Returns a dictionary of the known processors.
        :return: Dictionary of the known processors.
        """
        return cls._known_processors
