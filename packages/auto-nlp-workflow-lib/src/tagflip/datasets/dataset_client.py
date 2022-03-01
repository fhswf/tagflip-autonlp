import requests
import requests_cache
from datasets import Dataset, DatasetDict
from pydantic import parse_obj_as

from .dataset_processing_exception import DatasetProcessingException
from .processor import Processor
from .processors import *  # noqa
from .dataset_description import *


class DatasetClient:
    """
    Provides an interface to communicate with an AutoNLP Core dataset endpoint.
    """

    def __init__(self, instance_url: str):
        """
        Creates a new Client
        :param instance_url: The URL of an AutoNLP Core REST API
        """
        self._instance_url = instance_url

    def load_dataset(self, dataset_name: str, subset_name: str = None, dataset_provider_name: str = None,
                     split: Any = None) -> Union[DatasetDict, Dataset]:
        """
        The method returns a Hugging Face compatible dataset for the dataset described by AutoNLP dataset endpoint.
        :param dataset_name: The name of the dataset
        :param subset_name: The name of the subset to be selected
        :param dataset_provider_name: The name of the dataset provider.
        :param split: The desired split as defined in https://huggingface.co/docs/datasets/splits.html#.
        :raises:
            DatasetProcessingException if dataset could not be retrieved or if it could not be processed.
        :return: A Hugging Face Dataset
        """
        with requests_cache.enabled('tagflip_client_cache', expire_after=60 * 60 * 2):
            response = requests.get(f"{self._instance_url}/datasets/{dataset_provider_name}/dataset",
                                    params={"datasetName": dataset_name})
            if response.status_code > 300:
                raise DatasetProcessingException("Could not retrieve dataset from AutoNLP Core")

            request_data = response.json()
            dataset: ProvidedDataset = parse_obj_as(ProvidedDataset, request_data)
            if dataset.providerType in Processor.get_known_processors().keys():
                return Processor.get_known_processors().get(dataset.providerType).get_dataset(dataset, subset_name,
                                                                                              split)

            raise DatasetProcessingException(f"Could not find a processor for type {dataset.providerType}.")
