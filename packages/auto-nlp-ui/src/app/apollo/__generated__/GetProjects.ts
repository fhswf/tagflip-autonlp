/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProjects
// ====================================================

export interface GetProjects_projects {
  __typename: "Project";
  id: any;
  name: string;
  description: string | null;
  taskType: string;
  taskTypeName: string;
}

export interface GetProjects {
  projects: GetProjects_projects[];
}
