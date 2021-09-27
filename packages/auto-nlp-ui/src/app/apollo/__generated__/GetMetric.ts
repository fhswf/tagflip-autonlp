/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMetric
// ====================================================

export interface GetMetric_metricForRun_steps {
  __typename: "MetricStep";
  step: number;
  value: any;
}

export interface GetMetric_metricForRun {
  __typename: "Metric";
  runId: string;
  name: string;
  lastValue: any | null;
  steps: GetMetric_metricForRun_steps[] | null;
}

export interface GetMetric {
  metricForRun: GetMetric_metricForRun;
}

export interface GetMetricVariables {
  runId: string;
  metric: string;
}
