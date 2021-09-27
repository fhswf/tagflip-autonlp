/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetTraining
// ====================================================

export interface GetTraining_training_model_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface GetTraining_training_model_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: GetTraining_training_model_meta_source | null;
}

export interface GetTraining_training_model_profiles_script_metrics {
  __typename: "MetricDefinition";
  name: string;
  type: string;
  description: string;
  set: string;
  precision: number | null;
}

export interface GetTraining_training_model_profiles_script {
  __typename: "ModelScript";
  metrics: GetTraining_training_model_profiles_script_metrics[] | null;
}

export interface GetTraining_training_model_profiles {
  __typename: "Profile";
  name: string;
  script: GetTraining_training_model_profiles_script;
}

export interface GetTraining_training_model {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: GetTraining_training_model_meta | null;
  profiles: GetTraining_training_model_profiles[];
}

export interface GetTraining_training_profileDescription {
  __typename: "ProfileDescription";
  profile: string;
}

export interface GetTraining_training_runtimeDescription {
  __typename: "RuntimeDescription";
  runtime: string;
}

export interface GetTraining_training_run_topMetricForRun {
  __typename: "Metric";
  runId: string;
  name: string;
  lastValue: any | null;
}

export interface GetTraining_training_run {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
  topMetricForRun: GetTraining_training_run_topMetricForRun | null;
}

export interface GetTraining_training {
  __typename: "Training";
  id: any;
  earliestStartTime: any;
  latestEndTime: any;
  queueMessageId: string | null;
  model: GetTraining_training_model;
  profileDescription: GetTraining_training_profileDescription;
  runtimeDescription: GetTraining_training_runtimeDescription;
  run: GetTraining_training_run | null;
}

export interface GetTraining {
  training: GetTraining_training;
}

export interface GetTrainingVariables {
  trainingId: any;
}
