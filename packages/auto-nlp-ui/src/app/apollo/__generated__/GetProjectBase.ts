/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProjectBase
// ====================================================

export interface GetProjectBase_project_dataset {
  __typename: "DatasetAssignment";
  id: any;
  providerName: string;
  datasetName: string;
  subsetName: string;
}

export interface GetProjectBase_project {
  __typename: "Project";
  id: any;
  name: string;
  description: string | null;
  taskType: string;
  taskTypeName: string;
  dataset: GetProjectBase_project_dataset | null;
}

export interface GetProjectBase {
  project: GetProjectBase_project;
}

export interface GetProjectBaseVariables {
  projectId: any;
}
