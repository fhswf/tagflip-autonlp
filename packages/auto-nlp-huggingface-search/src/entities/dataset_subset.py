from dataclasses import dataclass

from datasets import DatasetInfo

from entities.supported_taks import SupportedTask


@dataclass
class DatasetSubset:
    """
    Contains a dataset and the NLP task associated with the dataset.
    """
    task: SupportedTask
    subset_info: DatasetInfo