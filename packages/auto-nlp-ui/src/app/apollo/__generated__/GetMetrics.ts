/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMetrics
// ====================================================

export interface GetMetrics_metricsForRun {
  __typename: "Metric";
  runId: string;
  name: string;
  lastValue: any | null;
}

export interface GetMetrics {
  metricsForRun: GetMetrics_metricsForRun[];
}

export interface GetMetricsVariables {
  runId: string;
}
