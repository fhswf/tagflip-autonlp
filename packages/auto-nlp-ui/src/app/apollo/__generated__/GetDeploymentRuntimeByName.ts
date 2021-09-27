/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDeploymentRuntimeByName
// ====================================================

export interface GetDeploymentRuntimeByName_deploymentRuntimeEnvironmentByName_parameters {
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

export interface GetDeploymentRuntimeByName_deploymentRuntimeEnvironmentByName {
  __typename: "RuntimeEnvironment";
  type: string | null;
  name: string;
  description: string | null;
  parameters: GetDeploymentRuntimeByName_deploymentRuntimeEnvironmentByName_parameters[] | null;
}

export interface GetDeploymentRuntimeByName {
  deploymentRuntimeEnvironmentByName: GetDeploymentRuntimeByName_deploymentRuntimeEnvironmentByName;
}

export interface GetDeploymentRuntimeByNameVariables {
  name: string;
}
