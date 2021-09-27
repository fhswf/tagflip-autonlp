import { gql } from '@apollo/client/core';
import { PARAMETER_DEFINITION_FIELDS } from './common-fragments';

const RUNTIME_BASE_FIELDS = gql`
  fragment RuntimeEnvironmentBaseFields on RuntimeEnvironment {
    type
    name
    description
  }
`;

export const GET_TRAINING_RUNTIMES = gql`
  ${RUNTIME_BASE_FIELDS}
  query GetTrainingRuntimes {
    trainingRuntimeEnvironments {
      ... on RuntimeEnvironment {
        ...RuntimeEnvironmentBaseFields
      }
    }
  }
`;

export const GET_TRAINING_RUNTIME_BY_NAME = gql`
  ${RUNTIME_BASE_FIELDS}
  ${PARAMETER_DEFINITION_FIELDS}
  query GetTrainingRuntimeByName($name: String!) {
    trainingRuntimeEnvironmentByName(name: $name) {
      ... on RuntimeEnvironment {
        ...RuntimeEnvironmentBaseFields
        parameters {
          ...ParameterDefinitionFields
        }
      }
    }
  }
`;

export const GET_DEPLOYMENT_RUNTIME_ENVIRONMENTS = gql`
  ${RUNTIME_BASE_FIELDS}
  ${PARAMETER_DEFINITION_FIELDS}
  query GetDeploymentRuntimes {
    deploymentRuntimeEnvironments {
      ... on RuntimeEnvironment {
        ...RuntimeEnvironmentBaseFields
      }
      parameters {
        ...ParameterDefinitionFields
      }
    }
  }
`;

export const GET_DEPLOYMENT_RUNTIME_ENVIRONMENT_BY_NAME = gql`
  ${RUNTIME_BASE_FIELDS}
  ${PARAMETER_DEFINITION_FIELDS}
  query GetDeploymentRuntimeByName($name: String!) {
    deploymentRuntimeEnvironmentByName(name: $name) {
      ... on RuntimeEnvironment {
        ...RuntimeEnvironmentBaseFields
        parameters {
          ...ParameterDefinitionFields
        }
      }
    }
  }
`;
