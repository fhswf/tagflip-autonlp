import { gql } from '@apollo/client/core';
import { MODEL_BASE_FIELDS } from './models';

export const METRIC_BASE_FIELDS = gql`
  fragment MetricBaseFields on Metric {
    runId
    name
    lastValue
  }
`;

export const RUN_BASE_FIELDS = gql`
  fragment RunBaseFields on Run {
    id
    runId
    dashboardUrl
    status
  }
`;

export const GET_TRAININGS = gql`
  ${MODEL_BASE_FIELDS}
  ${RUN_BASE_FIELDS}
  query GetTrainings($projectId: ObjectID!, $limit: Int, $offset: Int) {
    trainings(projectId: $projectId, limit: $limit, offset: $offset) {
      id
      earliestStartTime
      latestEndTime
      queueMessageId
      model {
        ...ModelBaseFields
      }
      profileDescription {
        profile
      }
      runtimeDescription {
        runtime
      }
      run {
        ...RunBaseFields
        topMetricForRun {
          runId
          name
          lastValue
        }
      }
    }
    trainingsCount(projectId: $projectId)
  }
`;

export const GET_TRAINING = gql`
  ${MODEL_BASE_FIELDS}
  ${METRIC_BASE_FIELDS}
  ${RUN_BASE_FIELDS}
  query GetTraining($trainingId: ObjectID!) {
    training(id: $trainingId) {
      id
      earliestStartTime
      latestEndTime
      queueMessageId
      model {
        ...ModelBaseFields
        profiles {
          name
          script {
            metrics {
              name
              type
              description
              set
              precision
            }
          }
        }
      }
      profileDescription {
        profile
      }
      runtimeDescription {
        runtime
      }
      run {
        ...RunBaseFields
        topMetricForRun {
          ...MetricBaseFields
        }
      }
    }
  }
`;

export const CREATE_TRAINING = gql`
  ${MODEL_BASE_FIELDS}
  mutation CreateTraining($data: CreateTrainingInput!) {
    createTraining(createTrainingInput: $data) {
      id
      earliestStartTime
      latestEndTime
      model {
        ...ModelBaseFields
      }
      profileDescription {
        id
        profile
        hyperParameters
        trainingParameters
      }
      runtimeDescription {
        id
        runtime
        parameters
      }
    }
  }
`;

export const DELETE_TRAINING = gql`
  mutation DeleteTraining($id: ObjectID!) {
    removeTrainingSoft(id: $id) {
      id
    }
  }
`;

export const CANCEL_RUN = gql`
  ${RUN_BASE_FIELDS}
  mutation CancelRun($runId: String!) {
    cancelRun(runId: $runId) {
      ...RunBaseFields
    }
  }
`;

// export const RUN_STATUS_CHANGED = gql`
//   ${RUN_BASE_FIELDS}
//   subscription OnTrainingRunStatusChanged {
//     trainingRunStatusChanged {
//       id
//       run {
//         ...RunBaseFields
//       }
//     }
//   }
// `;

export const GET_METRICS = gql`
  ${METRIC_BASE_FIELDS}
  query GetMetrics($runId: String!) {
    metricsForRun(runId: $runId) {
      ...MetricBaseFields
    }
  }
`;

export const GET_METRIC = gql`
  ${METRIC_BASE_FIELDS}
  query GetMetric($runId: String!, $metric: String!) {
    metricForRun(runId: $runId, metric: $metric) {
      ...MetricBaseFields
      steps {
        step
        value
      }
    }
  }
`;

export const GET_RUN_PARAMETERS = gql`
  query GetRunParameters($runId: String!) {
    runParameters(runId: $runId) {
      parameters
    }
  }
`;
