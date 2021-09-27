import asyncio
import logging
import os.path
from contextlib import contextmanager
from pickle import PickleError
from typing import Any, Dict, List, Type, Union

import datasets
import dill
from appdirs import *
from datasets import DatasetInfo
from expiringdict import ExpiringDict
from tqdm import tqdm

from entities import DatasetSubset, SupportedTask
from util import Singleton

_CACHE_DIR = user_cache_dir("tagflip-auto-nlp-huggingface-search")
_CACHE_FILE = os.path.join(_CACHE_DIR, "hf_dataset_cache.pickle")
_CACHE_LIFE_TIME = 60 * 60 * 24 * 30
_CACHE_LENGTH = 1500

logger = logging.getLogger("uvicorn")

DatasetName: Type = str
DatasetSubsetName: Type = str


class DatasetSearchService(Singleton):
    """
    This Service contains methods for retrieving datasets of certain type from HuggingFace API.
    Datasets retrieved from HuggingFace will be cached and be updated after a certain amount of time.
    """

    def _init(self):
        self._dataset_cache: ExpiringDict[DatasetName, Dict[DatasetSubsetName, DatasetSubset]] = ExpiringDict(
                max_len=_CACHE_LENGTH,
                max_age_seconds=_CACHE_LIFE_TIME)
        self._no_dataset_cache: ExpiringDict[DatasetName, Any] = ExpiringDict(max_len=_CACHE_LENGTH,
                                                                              max_age_seconds=_CACHE_LIFE_TIME)
        self._cache_update_task = asyncio.get_event_loop().create_task(self._forever_build_cache())
        self._updating = False

    def __del__(self):
        self._cache_update_task.cancel()

    @contextmanager
    def activate_update(self):
        self._updating = True
        try:
            yield
        finally:
            self._updating = False

    async def _forever_build_cache(self):
        """
        Builds up the cached datasets regularly. Therefore first it is checked which cached datasets are expired. After that
        new or updated datasets will be retrieved from HuggingFace API.
        """
        while True:
            await self._build_cache()
            await asyncio.sleep(_CACHE_LIFE_TIME / 1.25)

    async def _build_cache(self):
        """
         Builds up the cached datasets. Therefore first it is checked which cached datasets are expired. After that
         new or updated datasets will be retrieved from HuggingFace API.
         """
        if self._updating:
            logger.info("Cache building in progress. Skipping call...")
            return
        with self.activate_update():
            logger.info("Building cache...")
            if os.path.isfile(_CACHE_FILE):
                try:
                    with open(_CACHE_FILE, mode="rb") as f:
                        self._dataset_cache, self._no_dataset_cache = dill.load(f)
                except PickleError as e:
                    logger.warning(f"Could not unpickle cache file. {str(e)}")
                except OSError as e:
                    logger.warning(f"Could not load cache file: {str(e)}")
                except Exception as e:
                    logger.error(f"Could not load cache file: {str(e)}")
            if not os.path.isdir(_CACHE_DIR):
                os.makedirs(_CACHE_DIR)

            self._dataset_cache.items()
            self._no_dataset_cache.items()

            hf_datasets = await asyncio.get_event_loop().run_in_executor(None, datasets.list_datasets, (True, False))
            updatable_datasets = []
            for dataset in hf_datasets:
                if dataset not in self._dataset_cache.keys():
                    updatable_datasets.append(dataset)
            if len(updatable_datasets) > 0:
                updatable_datasets = [x for x in updatable_datasets if x not in self._no_dataset_cache.keys()]
                for dataset in tqdm(updatable_datasets):
                    logger.info("Updating " + dataset)
                    await self._get_hf_dataset_subsets(dataset, True)
                try:
                    with open(_CACHE_FILE, mode="wb") as f:
                        logger.info(
                                f"{'Updating' if os.path.exists(_CACHE_FILE) else 'Storing'} cache-file at '" + _CACHE_FILE + "'...")
                        dill.dump((self._dataset_cache, self._no_dataset_cache), f)
                        logger.info("Saved cache-file at '" + _CACHE_FILE + "'.")
                except PickleError as e:
                    logger.warning(f"Could not pickle cache file. {str(e)}")
                except OSError as e:
                    logger.error(f"Could not store cache file: {str(e)}")
        logger.info("Cache ready.")

    async def list_datasets(self, task: SupportedTask, update_cache=False) -> Dict[DatasetName, List[DatasetSubsetName]]:
        """
        Returns a list of cached datasets. This method does not retrieve new datasets from API unless update_cache is
        marked as True. Note that list_datasets with update_cache=True may take some while to return.
        :param task: the requested task
        :param update_cache: determines whether cache should be updated or not before retrieving data.
        :return: a string list of dataset names
        """
        if update_cache:
            await self._build_cache()

        ret = {}
        for dataset in sorted(self._dataset_cache.keys()):
            for subset in self._dataset_cache[dataset].keys():
                if self._dataset_cache[dataset][subset].task == task:
                    if dataset not in ret.keys():
                        ret[dataset] = []
                    ret[dataset].append(subset)

        return ret

    async def get_dataset_subsets(self, dataset_name: str, update_cache=False) \
            -> Union[Dict[DatasetSubsetName, DatasetSubset], None]:
        """
        Returns dataset subsets for the given dataset name as defined by HuggingFace API or None
        :param dataset_name: the name of the dataset.
        :param update_cache: determines whether cache should be updated or not before retrieving data.
        :return: dataset subsets
        """
        return await self._get_hf_dataset_subsets(dataset_name, force_reload=update_cache)

    async def _get_hf_dataset_subsets(self, dataset_name: str, force_reload=True) \
            -> Union[Dict[DatasetSubsetName, DatasetSubset], None]:
        """
        This method is responsible for retrieving dataset subsets either from cache or from HuggingFace API
        :param dataset_name: the name of the dataset.
        :param force_reload: a flag that forces a call to HuggingFace API though the dataset might be cached.
        :return: A dictionary of dataset subset names with dataset subsets assigned to them
        """
        if force_reload or dataset_name not in self._dataset_cache.keys():
            try:
                subsets: Dict[DatasetSubsetName, DatasetInfo] = await asyncio.get_event_loop().run_in_executor(None,
                                                                                                               datasets.get_dataset_infos,
                                                                                                               dataset_name)
                if len(subsets) == 0:
                    self._no_dataset_cache[dataset_name] = None
                    return None
                for subset_name, hf_dataset_info in subsets.items():
                    task = self._get_dataset_subset_task(hf_dataset_info)
                    if not task:
                        logger.info(
                                "Skipping dataset '" + str(dataset_name)
                                + "' since it is not compatible to supported types.")
                        self._no_dataset_cache[dataset_name] = None
                    else:
                        logger.info(
                                "Caching dataset subset '" + subset_name + "' for dataset '" + str(dataset_name) + "'")
                        if dataset_name not in self._dataset_cache.keys():
                            self._dataset_cache[dataset_name] = {}
                        self._dataset_cache[dataset_name][subset_name] = DatasetSubset(task=task,
                                                                                       subset_info=hf_dataset_info)
            except Exception as e:
                logger.warning("Could not inspect dataset due to missing dependencies: " + str(e))
                self._no_dataset_cache[dataset_name] = None
        if dataset_name in self._dataset_cache.keys():
            return self._dataset_cache[dataset_name]
        return None

    def _get_dataset_subset_task(self, hf_dataset_info: datasets.DatasetInfo) -> Union[SupportedTask, None]:
        """
        Returns the task of the given dataset info if supported or None.
        :param hf_dataset_info: the dataset infos
        :return: the supported task or None
        """
        for key in hf_dataset_info.features.keys():
            if key.startswith(tuple([f'{x}_tag' for x in ['ner']])):
                return SupportedTask.Token_Classification
            if key.startswith(tuple([f'{x}_tag' for x in ['pos']])):
                return SupportedTask.Token_Classification
            if key.startswith(tuple([f'{x}_tag' for x in ['chunk']])):
                return SupportedTask.Token_Classification
        return None
