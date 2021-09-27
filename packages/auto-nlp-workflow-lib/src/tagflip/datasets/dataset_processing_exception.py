class DatasetProcessingException(Exception):
    """
    Exception raised for errors during global preparation of datasets.
    """

    def __init__(self, message: str = "An not further defined exception occured."):
        """
        Exception constructor
        :param message: the message
        """
        self.message = message
        super().__init__(self.message)
