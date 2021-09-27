from typing import List, Optional, Union, Dict, Any

import dataclasses
from fastapi import HTTPException
from fastapi_utils.inferring_router import InferringRouter
from starlette import status

from entities import SupportedTask
from services import DatasetName, DatasetSubsetName, DatasetSearchService

router = InferringRouter(tags=["Huggingface Datasets"],
                         prefix='/datasets')


@router.get("/supportedTasks")
def get_supported_task_types() -> List[str]:
    """
    Returns an enumeration of supported NLP task this api returns datasets for.
    :return: a list of supported NLP tasks.
    """
    return [task for task in SupportedTask]


@router.get("/")
async def list_datasets(task: SupportedTask, update_cache: Optional[bool] = False) -> Dict[DatasetName, List[DatasetSubsetName]]:
    """
    Returns a list of cached datasets. This method does not retrieve new datasets from API unless update_cache is
    marked as True. Note that list_datasets with update_cache=True may take some while to return.
    :return: a string list of dataset names
    """
    return await DatasetSearchService().list_datasets(task, update_cache)


@router.get("/{dataset_name}")
async def get_dataset_subsets(dataset_name: str, update_cache: Optional[bool] = False) \
        -> Union[Dict[DatasetSubsetName, Dict[str, Any]], None]:
    """
    Returns dataset subsets for the given dataset name as defined by HuggingFace API or None.
    :param update_cache: determines whether cache should be updated or not before retrieving data.
    :param dataset_name: the name of the dataset.
    :return: dataset subsets
    """
    dataset_subsets = await DatasetSearchService().get_dataset_subsets(dataset_name, update_cache)
    if dataset_subsets is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found for name " + dataset_name)

    # TODO: Temporal unwind due to issues with pydantic and dataclasses (
    #  https://github.com/samuelcolvin/pydantic/issues/2555). Might be removed when issues are solved
    ret = dict()
    for subset_name, subset_info in dataset_subsets.items():
        ret[subset_name] = dataclasses.asdict(subset_info)
    return ret


@router.get("/{dataset_name}/{subset_name}")
async def get_dataset_subset(dataset_name: str, subset_name: str, update_cache: Optional[bool] = False) \
        -> Dict[DatasetSubsetName, Dict[str, Any]]:
    """
    Returns a dataset subset for the given dataset name and subset name as defined by HuggingFace API or None.
    :param update_cache: determines whether cache should be updated or not before retrieving data.
    :param dataset_name: the name of the dataset.
    :param subset_name: the name of the subset in the dataset.
    :return: dataset subset infos
    """
    dataset_subsets = await DatasetSearchService().get_dataset_subsets(dataset_name, update_cache)
    if dataset_subsets is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found for name " + dataset_name)
    if subset_name not in dataset_subsets.keys():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subset not found for name " + subset_name)
    return dataclasses.asdict(dataset_subsets[subset_name])
