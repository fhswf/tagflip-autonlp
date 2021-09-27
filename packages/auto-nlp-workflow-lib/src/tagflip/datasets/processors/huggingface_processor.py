# coding=utf-8
# Copyright 2020 HuggingFace Datasets Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import absolute_import, division, print_function

from typing import Any

import datasets
from datasets import Dataset, load_dataset

from tagflip.datasets.dataset_description import ProvidedDataset
from tagflip.datasets.processor import Processor

logger = datasets.logging.get_logger(__name__)


@Processor.type('huggingface')
class HuggingFace(Processor):

    def get_dataset(self, provided_dataset: ProvidedDataset, subset_name: str = None, split: Any = None) -> Dataset:
        return load_dataset(provided_dataset.name, name=subset_name, split=split)
