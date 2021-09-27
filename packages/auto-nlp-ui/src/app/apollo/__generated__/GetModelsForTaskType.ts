/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskType } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetModelsForTaskType
// ====================================================

export interface GetModelsForTaskType_modelsByTask_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface GetModelsForTaskType_modelsByTask_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: GetModelsForTaskType_modelsByTask_meta_source | null;
}

export interface GetModelsForTaskType_modelsByTask {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: GetModelsForTaskType_modelsByTask_meta | null;
}

export interface GetModelsForTaskType {
  modelsByTask: GetModelsForTaskType_modelsByTask[];
}

export interface GetModelsForTaskTypeVariables {
  taskType: TaskType;
}
