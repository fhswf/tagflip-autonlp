/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetModel
// ====================================================

export interface GetModel_model_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface GetModel_model_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: GetModel_model_meta_source | null;
}

export interface GetModel_model_profiles_script_metrics {
  __typename: "MetricDefinition";
  name: string;
  type: string;
  description: string;
  set: string;
  precision: number | null;
}

export interface GetModel_model_profiles_script_fixedParameters {
  __typename: "ParameterDefinition";
  name: string;
  type: string | null;
  choice: any | null;
  range: any | null;
  regex: string | null;
  default: any | null;
  description: string | null;
  readableName: string | null;
  optional: boolean | null;
}

export interface GetModel_model_profiles_script_hyperParameters {
  __typename: "ParameterDefinition";
  name: string;
  type: string | null;
  choice: any | null;
  range: any | null;
  regex: string | null;
  default: any | null;
  description: string | null;
  readableName: string | null;
  optional: boolean | null;
}

export interface GetModel_model_profiles_script_trainingParameters {
  __typename: "ParameterDefinition";
  name: string;
  type: string | null;
  choice: any | null;
  range: any | null;
  regex: string | null;
  default: any | null;
  description: string | null;
  readableName: string | null;
  optional: boolean | null;
}

export interface GetModel_model_profiles_script {
  __typename: "ModelScript";
  metrics: GetModel_model_profiles_script_metrics[] | null;
  fixedParameters: GetModel_model_profiles_script_fixedParameters[];
  hyperParameters: GetModel_model_profiles_script_hyperParameters[];
  trainingParameters: GetModel_model_profiles_script_trainingParameters[];
}

export interface GetModel_model_profiles {
  __typename: "Profile";
  name: string;
  taskType: string;
  description: string;
  defaultTrainingMinutes: number;
  script: GetModel_model_profiles_script;
}

export interface GetModel_model {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: GetModel_model_meta | null;
  profiles: GetModel_model_profiles[];
}

export interface GetModel {
  model: GetModel_model;
}

export interface GetModelVariables {
  modelId: string;
}
