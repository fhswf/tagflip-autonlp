/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTaskTypes
// ====================================================

export interface GetTaskTypes_taskTypes {
  __typename: "TaskTypeEntity";
  id: string;
  label: string | null;
}

export interface GetTaskTypes {
  taskTypes: GetTaskTypes_taskTypes[];
}
