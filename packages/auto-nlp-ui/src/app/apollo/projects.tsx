import { gql } from '@apollo/client/core';

export const PROJECT_BASE_FIELDS = gql`
  fragment ProjectBaseFields on Project {
    id
    name
    description
    taskType
    taskTypeName
  }
`;

export const GET_PROJECTS = gql`
  ${PROJECT_BASE_FIELDS}
  query GetProjects {
    projects {
      ...ProjectBaseFields
    }
  }
`;

export const CREATE_PROJECT = gql`
  ${PROJECT_BASE_FIELDS}
  mutation CreateProject($data: CreateProjectInput!) {
    createProject(createProjectInput: $data) {
      ...ProjectBaseFields
    }
  }
`;

export const UPDATE_PROJECT = gql`
  ${PROJECT_BASE_FIELDS}
  mutation UpdateProject($id: ObjectID!, $data: UpdateProjectInput!) {
    updateProject(id: $id, updateProjectInput: $data) {
      ...ProjectBaseFields
      dataset {
        id
        providerName
        datasetName
        subsetName
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ObjectID!) {
    removeProject(id: $id) {
      id
    }
  }
`;

export const GET_PROJECT_BASE = gql`
  ${PROJECT_BASE_FIELDS}
  query GetProjectBase($projectId: ObjectID!) {
    project(id: $projectId) {
      ...ProjectBaseFields
      dataset {
        id
        providerName
        datasetName
        subsetName
      }
    }
  }
`;
