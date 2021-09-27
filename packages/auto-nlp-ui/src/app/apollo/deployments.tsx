import { gql } from '@apollo/client/core';
import { RUN_BASE_FIELDS } from './trainings';

export const CREATE_DEPLOYMENT = gql`
  mutation CreateDeployment($data: CreateDeploymentInput!) {
    createDeployment(createDeploymentInput: $data) {
      id
      runtimeDescription {
        id
        runtime
        parameters
      }
    }
  }
`;

export const REMOVE_DEPLOYMENT = gql`
  mutation RemoveDeployment($id: ObjectID!) {
    removeDeployment(id: $id) {
      id
    }
  }
`;

export const GET_DEPLOYMENT_COUNT = gql`
  query GetDeploymentCount($projectId: ObjectID!) {
    deploymentsCount(projectId: $projectId)
  }
`;

export const GET_DEPLOYMENTS = gql`
  ${RUN_BASE_FIELDS}
  query GetDeployments($projectId: ObjectID!, $limit: Int, $offset: Int) {
    deployments(projectId: $projectId, limit: $limit, offset: $offset) {
      id
      run {
        ...RunBaseFields
        training {
          id
          model {
            id
            name
          }
          profileDescription {
            id
            profile
          }
        }
      }
      deploymentId
      runtimeDescription {
        id
        runtime
      }
      info {
        deploymentId
        status
        runtime
      }
    }
    deploymentsCount(projectId: $projectId)
  }
`;

export const GET_DEPLOYMENT = gql`
  ${RUN_BASE_FIELDS}
  query GetDeployment($id: ObjectID!) {
    deployment(id: $id) {
      id
      run {
        ...RunBaseFields
        training {
          id
          model {
            id
            name
          }
          profileDescription {
            id
            profile
          }
        }
      }
      runtimeDescription {
        id
        runtime
      }
      info {
        deploymentId
        endpoint {
          url
          method
        }
        proxyEndpoint {
          url
          method
        }
        status
        runtime
      }
    }
  }
`;

export const TEST_DEPLOYMENT = gql`
  query TestDeployment($id: ObjectID!, $input: JSON!) {
    testDeployment(id: $id, input: $input)
  }
`;
