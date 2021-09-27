/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateTrainingInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateTraining
// ====================================================

export interface CreateTraining_createTraining_model_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface CreateTraining_createTraining_model_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: CreateTraining_createTraining_model_meta_source | null;
}

export interface CreateTraining_createTraining_model {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: CreateTraining_createTraining_model_meta | null;
}

export interface CreateTraining_createTraining_profileDescription {
  __typename: "ProfileDescription";
  id: any;
  profile: string;
  hyperParameters: any;
  trainingParameters: any;
}

export interface CreateTraining_createTraining_runtimeDescription {
  __typename: "RuntimeDescription";
  id: any;
  runtime: string;
  parameters: any | null;
}

export interface CreateTraining_createTraining {
  __typename: "Training";
  id: any;
  earliestStartTime: any;
  latestEndTime: any;
  model: CreateTraining_createTraining_model;
  profileDescription: CreateTraining_createTraining_profileDescription;
  runtimeDescription: CreateTraining_createTraining_runtimeDescription;
}

export interface CreateTraining {
  createTraining: CreateTraining_createTraining;
}

export interface CreateTrainingVariables {
  data: CreateTrainingInput;
}
