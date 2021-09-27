class AutoNLPWorkflowException(Exception):
    """
    Exception raised for errors during AutoNLP Workflow.
    """

    def __init__(self, message: str = "An not further defined exception occured."):
        """
        Exception constructor
        :param message: the message
        """
        self.message = message
        super().__init__(self.message)
