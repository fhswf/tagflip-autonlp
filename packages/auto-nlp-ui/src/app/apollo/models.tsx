import { gql } from '@apollo/client/core';
import { PARAMETER_DEFINITION_FIELDS } from './common-fragments';

export const MODEL_BASE_FIELDS = gql`
  fragment ModelBaseFields on Model {
    id
    name
    languages
    meta {
      description
      source {
        url
      }
    }
  }
`;

export const GET_MODELS_FOR_TASK_TYPE = gql`
  query GetModelsForTaskType($taskType: TaskType!) {
    modelsByTask(taskType: $taskType) {
      id
      name
      languages
      meta {
        description
        source {
          url
        }
      }
    }
  }
`;

export const GET_MODEL = gql`
  ${MODEL_BASE_FIELDS}
  ${PARAMETER_DEFINITION_FIELDS}
  query GetModel($modelId: String!) {
    model(id: $modelId) {
      ...ModelBaseFields
      profiles {
        name
        taskType
        description
        defaultTrainingMinutes
        script {
          metrics {
            name
            type
            description
            set
            precision
          }
          fixedParameters {
            ...ParameterDefinitionFields
          }
          hyperParameters {
            ...ParameterDefinitionFields
          }
          trainingParameters {
            ...ParameterDefinitionFields
          }
        }
      }
    }
  }
`;
