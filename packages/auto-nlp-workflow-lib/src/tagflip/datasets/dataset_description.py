from __future__ import annotations

from pydantic import BaseModel, Field
from pydantic.fields import Annotated
from typing import Dict, Any, List, Optional, Union
from typing_extensions import Literal


class Feature(BaseModel):
    """
    A Feature of a Dataset subset.
    """

    id: Optional[Any]
    name: str
    dtype: Optional[Any]
    type: Literal['Feature'] = Field('Feature', alias="_type")

    class Config:
        allow_population_by_field_name = True


class ClassLabel(Feature):
    """
     A ClassLabel is a Feature of a DatasetSubset that represents the classes  of the classification task.
     """

    names: List[str] = Field(None, alias="names")
    type: Literal['ClassLabel'] = Field('ClassLabel', alias="_type")

    class Config:
        allow_population_by_field_name = True


class Value(Feature):
    """
    A Value is a simple Feature of a certain type.
    """

    type: Literal['Value'] = Field('Value', alias="_type")

    class Config:
        allow_population_by_field_name = True


class Sequence(Feature):
    """
    A Sequence is a list of a specific feature.
    """

    feature: Annotated[Union[Sequence, ClassLabel, Value], Field(descriminator='type')]
    type: Literal['Sequence'] = Field('Sequence', alias="_type")
    length: int = Field(-1)

    class Config:
        allow_population_by_field_name = True


Sequence.update_forward_refs()


class FileInstruction(BaseModel):
    """
    A FileInstruction belongs to a Split and describes which samples of files of the DatasetSubset should be part of it.
    """
    filename: str
    numberOfExamples: Optional[int]
    skip: Optional[int]
    take: Optional[int]


class Split(BaseModel):
    """
    A Split is a subset of of files of a DatasetSubset.
    """
    name: str
    files: List[FileInstruction]


class DownloadableFile(BaseModel):
    """
    A DownloadableFile belongs to a DatasetSubset and describes a location of a file or archive to be downloaded.
    """
    url: str
    hash: Optional[str]
    hashAlgorithm: Optional[str]


class DownloadConfiguration(BaseModel):
    """
    A DownloadConfiguration belongs to a DatasetSubset and describes all DownloadableFiles.
    """
    files: List[DownloadableFile] = []


class DatasetSubset(BaseModel):
    """
    A DatasetSubset is a specific set of data that belongs to a Dataset. The DatasetSubset defines Features,
    Files and Splits.
    """
    name: str
    description: Optional[str]
    version: Optional[str]
    features: Optional[Dict[str, Union[Sequence, ClassLabel, Value]]]
    splits: Optional[Dict[str, Split]]
    homepage: Optional[str]
    license: Optional[str]
    citation: Optional[str]
    download: Optional[DownloadConfiguration]


class ProvidedDataset(BaseModel):
    """
    A ProvidedDataset is a container for related DatasetSubsets and is being provided by a certain Provider.
    """
    name: str
    subsets: List[DatasetSubset]
    providerName: Optional[str]
    providerType: Optional[str]
