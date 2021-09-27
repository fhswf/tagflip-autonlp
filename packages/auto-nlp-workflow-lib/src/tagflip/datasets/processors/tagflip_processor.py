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

import os
from dataclasses import dataclass

import requests
from typing import Any

import datasets
from datasets import DatasetDict, Dataset, load_dataset, tqdm

from tagflip.datasets.dataset_description import ProvidedDataset
from tagflip.datasets.processor import Processor

logger = datasets.logging.get_logger(__name__)


@Processor.type('tagflip')
class TagFlipProcessor(Processor):

    def get_dataset(self, provided_dataset: ProvidedDataset, subset_name: str = None, split: Any = None) \
            -> [DatasetDict, Dataset]:
        return load_dataset(__file__, provided_dataset=provided_dataset, name=subset_name, split=split)


@dataclass
class TagflipManagedDatasetConfig(datasets.BuilderConfig):
    provided_dataset: ProvidedDataset = None


class TagflipManagedDataset(datasets.GeneratorBasedBuilder):
    BUILDER_CONFIG_CLASS = TagflipManagedDatasetConfig

    def _info(self):
        # dataset_name = self.config.provided_dataset
        print(f"The dataset is {str(self.config.provided_dataset)}")
        dataset_info = list(filter(lambda x: x.name == self.config.name, self.config.provided_dataset.subsets))[0]

        features = datasets.Features.from_dict(dataset_info.dict(by_alias=True)[
                                                   'features'])  # getting features from given description; by_alias ensures usage of alias names for fields which is required for field _type.

        if "id" not in features.keys():
            features["id"] = datasets.Value("string")  # Adding id feature

        hf_dataset_info = datasets.DatasetInfo(
            description=dataset_info.description,
            features=features,
            license=dataset_info.license,
            homepage=dataset_info.homepage,
            citation=dataset_info.citation,
        )
        logger.debug("Calling _info", str(hf_dataset_info))
        return hf_dataset_info

    def _download_tagflip_corpus(self, src_url: str, dst_path: str) -> Any:
        response = requests.get(f"{src_url}")
        total_size_in_bytes = int(response.headers.get('content-length', 0))
        block_size = 1024  # 1 Kibibyte
        logger.info(f"Downloading ${src_url} to ${dst_path}")
        with tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True) as pb:
            with open(dst_path, 'wb') as file:
                for data in response.iter_content(block_size):
                    pb.update(len(data))
                    file.write(data)

    def _split_generators(self, dl_manager):
        logger.debug("Calling _split_generators")
        # dataset_name = self.config.provided_dataset.name
        dataset_info = list(filter(lambda x: x.name == self.config.name, self.config.provided_dataset.subsets))[0]
        urls = [x for x in map(lambda x: x.url, dataset_info.download.files)]  # getting urls from description

        downloaded_files = dl_manager.extract(dl_manager.download_custom(urls, self._download_tagflip_corpus))
        splits = {}

        # create hf splits from defined splits.
        for split_name in dataset_info.splits.keys():
            split_description = dataset_info.splits[split_name]
            file_base_names = map(lambda x: x.filename, split_description.files)
            splits[split_name] = []
            selected_files = set()
            for required_file in file_base_names:
                if required_file not in selected_files:
                    for folder in downloaded_files:
                        for root, dirs, files in os.walk(folder):
                            for file in files:
                                if file.startswith(required_file):
                                    splits[split_name].append(os.path.join(root, file))
                                    selected_files.add(required_file)

        generated_splits = []
        for split_name in splits.keys():
            generated_splits.append(
                datasets.SplitGenerator(name=split_name, gen_kwargs={"filepath": splits[split_name]}))
        return generated_splits

    def _generate_examples(self, filepath):
        logger.info(f"Generating examples from {filepath}")
        # dataset_name = self.config.provided_dataset.name
        dataset_info = list(filter(lambda x: x.name == self.config.name, self.config.provided_dataset.subsets))[0]

        label_list = dataset_info.features['ner_tags'].feature.names
        label_mapping = dict([(label, i) for i, label in enumerate(label_list)])

        # if len(label_mapping) == 1 and "O" in label_mapping.keys():
        #     raise RuntimeError(f"No labels found for TagFlip dataset {dataset_name}")

        sentence_counter = 0
        current_tag_candidates = []
        current_tokens = []

        def build_sentence(id, tokens, tag_candidates):
            """
            Convenience function for creating a sentence.
            :param id: the sentence number
            :param tokens: the tokens of the sentence
            :param tag_candidates: the tag candidates (tags, nested tags)
            :return: an example as required by hf
            """
            tags = []
            nested_tags = []
            for tag, nested_tag in tag_candidates:
                tags.append(label_mapping[tag] if tag in label_mapping else "O")
                nested_tags.append(label_mapping[nested_tag] if nested_tag in label_mapping else "O")
            assert len(tokens) == len(
                tags), f"Mismatch between length of tokens ({len(tokens)}) and tags ({len(tags)}) for sentence {sentence_counter}: Sentence is: {tokens}, Tags are: {tags}"
            assert len(tags) == len(
                nested_tags), f"Mismatch between length of tags ({len(tags)}) and nested tags ({len(nested_tags)}) for sentence  {sentence_counter}"
            #
            # print(tokens)
            # print([label_list[t] for t in tags])
            # print()

            return (
                id, {
                    "id": str(id),
                    "tokens": tokens,
                    "ner_tags": tags,
                    "nested_ner_tags": nested_tags
                }
            )

        for file in filepath:
            with open(file) as f:
                for line in f.readlines():
                    if line.strip().startswith("#"):
                        continue  # skip comments
                    if line.strip() == "":
                        # sentence ended
                        if len(current_tokens) > 0:
                            sentence = build_sentence(sentence_counter, current_tokens, current_tag_candidates)
                            current_tokens = []
                            current_tag_candidates = []
                            sentence_counter += 1

                            yield sentence
                    else:
                        # append tokens and tags to current sentence
                        nr, rng, token, tags = line.split()
                        current_tokens.append(token)
                        tags = (tags.split("|"))  # tags are separated by | in TSV file
                        tags += "O" * (2 - len(tags))  # fill nested with O-tag if necessary
                        current_tag_candidates.append(tags)
            # also yield the last sentence in file
            yield build_sentence(sentence_counter, current_tokens, current_tag_candidates)
