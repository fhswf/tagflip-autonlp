/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateProjectInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateProject
// ====================================================

export interface UpdateProject_updateProject_dataset {
  __typename: "DatasetAssignment";
  id: any;
  providerName: string;
  datasetName: string;
  subsetName: string;
}

export interface UpdateProject_updateProject {
  __typename: "Project";
  id: any;
  name: string;
  description: string | null;
  taskType: string;
  taskTypeName: string;
  dataset: UpdateProject_updateProject_dataset | null;
}

export interface UpdateProject {
  updateProject: UpdateProject_updateProject;
}

export interface UpdateProjectVariables {
  id: any;
  data: UpdateProjectInput;
}
