from dataclasses import dataclass, field

from typing import Optional


@dataclass
class AutoNLPArguments:
    """
    These arguments belong explicitly to the AutoNLP Workflow of the TagFlip AutoNLP application.
    """

    project_id: str = field(metadata={"help": "Name of project this training belongs to"})

    training_id: str = field(metadata={"help": "The ID that will be used to identify the training in MLflow"})

    tagflip_host: str = field(metadata={"help": "Host to TagFlip AutoNLP Core"})

    dataset_name: str = field(default=None, metadata={"help": "The name of the dataset to use."})

    subset_name: Optional[str] = field(default=None, metadata={"help": "The subset name of the dataset to use."})

    dataset_provider_name: Optional[str] = field(default=None,
                                                 metadata={"help": "The name of the dataset provider to use."})

    search_hyperparams: Optional[bool] = field(default=False, metadata={
        "help": "Determines if hyperparameter search should be performed if possible or not"})
