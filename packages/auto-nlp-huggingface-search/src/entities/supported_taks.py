from enum import Enum


class SupportedTask(str, Enum):
    """
    Contains an enumeration of supported NLP task this api returns datasets for.
    """
    Token_Classification = 'Token_Classification',
    Text_Classification = 'Text_Classification'
