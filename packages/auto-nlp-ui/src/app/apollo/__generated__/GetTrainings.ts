/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetTrainings
// ====================================================

export interface GetTrainings_trainings_model_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface GetTrainings_trainings_model_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: GetTrainings_trainings_model_meta_source | null;
}

export interface GetTrainings_trainings_model {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: GetTrainings_trainings_model_meta | null;
}

export interface GetTrainings_trainings_profileDescription {
  __typename: "ProfileDescription";
  profile: string;
}

export interface GetTrainings_trainings_runtimeDescription {
  __typename: "RuntimeDescription";
  runtime: string;
}

export interface GetTrainings_trainings_run_topMetricForRun {
  __typename: "Metric";
  runId: string;
  name: string;
  lastValue: any | null;
}

export interface GetTrainings_trainings_run {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
  topMetricForRun: GetTrainings_trainings_run_topMetricForRun | null;
}

export interface GetTrainings_trainings {
  __typename: "Training";
  id: any;
  earliestStartTime: any;
  latestEndTime: any;
  queueMessageId: string | null;
  model: GetTrainings_trainings_model;
  profileDescription: GetTrainings_trainings_profileDescription;
  runtimeDescription: GetTrainings_trainings_runtimeDescription;
  run: GetTrainings_trainings_run | null;
}

export interface GetTrainings {
  trainings: GetTrainings_trainings[];
  trainingsCount: number;
}

export interface GetTrainingsVariables {
  projectId: any;
  limit?: number | null;
  offset?: number | null;
}
