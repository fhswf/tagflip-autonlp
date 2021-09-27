import { gql } from '@apollo/client/core';

export const PARAMETER_DEFINITION_FIELDS = gql`
  fragment ParameterDefinitionFields on ParameterDefinition {
    name
    type
    choice
    range
    regex
    default
    description
    readableName
    optional
  }
`;
