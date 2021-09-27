import { gql } from '@apollo/client/core';

export const GET_TASK_TYPES = gql`
  query GetTaskTypes {
    taskTypes {
      id
      label
    }
  }
`;
