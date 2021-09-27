/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetDeployments
// ====================================================

export interface GetDeployments_deployments_run_training_model {
  __typename: "Model";
  id: string;
  name: string;
}

export interface GetDeployments_deployments_run_training_profileDescription {
  __typename: "ProfileDescription";
  id: any;
  profile: string;
}

export interface GetDeployments_deployments_run_training {
  __typename: "Training";
  id: any;
  model: GetDeployments_deployments_run_training_model;
  profileDescription: GetDeployments_deployments_run_training_profileDescription;
}

export interface GetDeployments_deployments_run {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
  training: GetDeployments_deployments_run_training | null;
}

export interface GetDeployments_deployments_runtimeDescription {
  __typename: "RuntimeDescription";
  id: any;
  runtime: string;
}

export interface GetDeployments_deployments_info {
  __typename: "DeploymentInfo";
  deploymentId: string;
  status: string;
  runtime: string;
}

export interface GetDeployments_deployments {
  __typename: "Deployment";
  id: any;
  run: GetDeployments_deployments_run;
  deploymentId: string | null;
  runtimeDescription: GetDeployments_deployments_runtimeDescription;
  info: GetDeployments_deployments_info;
}

export interface GetDeployments {
  deployments: GetDeployments_deployments[];
  deploymentsCount: number;
}

export interface GetDeploymentsVariables {
  projectId: any;
  limit?: number | null;
  offset?: number | null;
}
