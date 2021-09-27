/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ModelBaseFields
// ====================================================

export interface ModelBaseFields_meta_source {
  __typename: "ModelSourceMeta";
  url: string | null;
}

export interface ModelBaseFields_meta {
  __typename: "ModelMeta";
  description: string | null;
  source: ModelBaseFields_meta_source | null;
}

export interface ModelBaseFields {
  __typename: "Model";
  id: string;
  name: string;
  languages: string[];
  meta: ModelBaseFields_meta | null;
}
