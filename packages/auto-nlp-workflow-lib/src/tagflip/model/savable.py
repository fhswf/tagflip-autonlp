from abc import ABC, abstractmethod

from ..model.autonlp_arguments import AutoNLPArguments


class Savable(ABC):
    """
    A Savable is an instance of a model that has been trained but not saved.
    """

    @abstractmethod
    def save_model(self, autonlp_args: AutoNLPArguments):
        """
        Saves the model to TagFlip AutoNLP infrastructure
        :param autonlp_args: the AutoNLP Workflow arguments
        """
        raise not NotImplemented("save_model")
