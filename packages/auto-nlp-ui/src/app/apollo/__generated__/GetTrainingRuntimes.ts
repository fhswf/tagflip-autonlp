/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTrainingRuntimes
// ====================================================

export interface GetTrainingRuntimes_trainingRuntimeEnvironments {
  __typename: "RuntimeEnvironment";
  type: string | null;
  name: string;
  description: string | null;
}

export interface GetTrainingRuntimes {
  trainingRuntimeEnvironments: GetTrainingRuntimes_trainingRuntimeEnvironments[];
}
