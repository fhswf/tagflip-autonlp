/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateDeploymentInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateDeployment
// ====================================================

export interface CreateDeployment_createDeployment_runtimeDescription {
  __typename: "RuntimeDescription";
  id: any;
  runtime: string;
  parameters: any | null;
}

export interface CreateDeployment_createDeployment {
  __typename: "Deployment";
  id: any;
  runtimeDescription: CreateDeployment_createDeployment_runtimeDescription;
}

export interface CreateDeployment {
  createDeployment: CreateDeployment_createDeployment;
}

export interface CreateDeploymentVariables {
  data: CreateDeploymentInput;
}
