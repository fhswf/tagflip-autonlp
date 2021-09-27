/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetDeployment
// ====================================================

export interface GetDeployment_deployment_run_training_model {
  __typename: "Model";
  id: string;
  name: string;
}

export interface GetDeployment_deployment_run_training_profileDescription {
  __typename: "ProfileDescription";
  id: any;
  profile: string;
}

export interface GetDeployment_deployment_run_training {
  __typename: "Training";
  id: any;
  model: GetDeployment_deployment_run_training_model;
  profileDescription: GetDeployment_deployment_run_training_profileDescription;
}

export interface GetDeployment_deployment_run {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
  training: GetDeployment_deployment_run_training | null;
}

export interface GetDeployment_deployment_runtimeDescription {
  __typename: "RuntimeDescription";
  id: any;
  runtime: string;
}

export interface GetDeployment_deployment_info_endpoint {
  __typename: "Endpoint";
  url: string;
  method: string;
}

export interface GetDeployment_deployment_info_proxyEndpoint {
  __typename: "Endpoint";
  url: string;
  method: string;
}

export interface GetDeployment_deployment_info {
  __typename: "DeploymentInfo";
  deploymentId: string;
  endpoint: GetDeployment_deployment_info_endpoint | null;
  proxyEndpoint: GetDeployment_deployment_info_proxyEndpoint | null;
  status: string;
  runtime: string;
}

export interface GetDeployment_deployment {
  __typename: "Deployment";
  id: any;
  run: GetDeployment_deployment_run;
  runtimeDescription: GetDeployment_deployment_runtimeDescription;
  info: GetDeployment_deployment_info;
}

export interface GetDeployment {
  deployment: GetDeployment_deployment;
}

export interface GetDeploymentVariables {
  id: any;
}
