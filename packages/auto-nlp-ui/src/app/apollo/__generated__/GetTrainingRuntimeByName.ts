/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTrainingRuntimeByName
// ====================================================

export interface GetTrainingRuntimeByName_trainingRuntimeEnvironmentByName_parameters {
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

export interface GetTrainingRuntimeByName_trainingRuntimeEnvironmentByName {
  __typename: "RuntimeEnvironment";
  type: string | null;
  name: string;
  description: string | null;
  parameters: GetTrainingRuntimeByName_trainingRuntimeEnvironmentByName_parameters[] | null;
}

export interface GetTrainingRuntimeByName {
  trainingRuntimeEnvironmentByName: GetTrainingRuntimeByName_trainingRuntimeEnvironmentByName;
}

export interface GetTrainingRuntimeByNameVariables {
  name: string;
}
