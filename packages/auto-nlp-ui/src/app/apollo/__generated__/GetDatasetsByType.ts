/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskType } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetDatasetsByType
// ====================================================

export interface GetDatasetsByType_datasetsByType_subsets {
  __typename: "DatasetSubset";
  id: string;
  name: string;
}

export interface GetDatasetsByType_datasetsByType {
  __typename: "Dataset";
  id: string;
  name: string;
  providerName: string;
  subsets: GetDatasetsByType_datasetsByType_subsets[];
}

export interface GetDatasetsByType {
  datasetsByType: GetDatasetsByType_datasetsByType[];
}

export interface GetDatasetsByTypeVariables {
  datasetProvider: string;
  taskType: TaskType;
}
