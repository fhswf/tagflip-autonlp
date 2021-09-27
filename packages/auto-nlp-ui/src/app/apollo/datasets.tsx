import { gql } from '@apollo/client/core';
import { PARAMETER_DEFINITION_FIELDS } from './common-fragments';

export const GET_DATASET_PROVIDERS = gql`
  query GetDatasetProviders {
    datasetProviders
  }
`;

export const GET_DATASETS_BY_TYPE = gql`
  query GetDatasetsByType($datasetProvider: String!, $taskType: TaskType!) {
    datasetsByType(datasetProvider: $datasetProvider, taskType: $taskType) {
      id
      name
      providerName
      subsets {
        id
        name
      }
    }
  }
`;
