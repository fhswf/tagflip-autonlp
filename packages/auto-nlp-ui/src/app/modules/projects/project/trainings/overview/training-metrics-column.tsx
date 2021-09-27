import { useQuery } from '@apollo/client';
import { Spin, Statistic } from 'antd';
import { MetricDefinition } from 'auto-nlp-shared-js';
import React, { FunctionComponent } from 'react';
import { GetMetric } from '../../../../../apollo/__generated__/GetMetric';
import { GetTraining } from '../../../../../apollo/__generated__/GetTraining';
import { GetTrainings_trainings } from '../../../../../apollo/__generated__/GetTrainings';
import { GET_METRIC, GET_TRAINING } from '../../../../../apollo/trainings';

const TrainingMetric: FunctionComponent<{
  runId: string;
  metric: MetricDefinition;
}> = (props) => {
  const {
    data: metric,
    loading: metricLoading,
    error: metricError,
  } = useQuery<GetMetric>(GET_METRIC, {
    skip: !props.runId,
    variables: {
      runId: props.runId,
      metric: props.metric.name,
    },
  });

  return (
    <Statistic
      loading={metricLoading}
      title={props.metric.description || metric?.metricForRun?.name}
      value={metric?.metricForRun?.lastValue}
      precision={4}
    />
  );
};

const TrainingMetricsColumn: FunctionComponent<{
  trainingId: string;
}> = (props) => {
  const {
    data: trainingData,
    loading: trainingLoading,
    error: trainingError,
  } = useQuery<GetTraining>(GET_TRAINING, {
    skip: !props.trainingId,
    variables: {
      trainingId: props.trainingId,
    },
  });

  if (trainingLoading) return <Spin spinning={true} />;

  const modelData = trainingData?.training?.model;
  const profileMetrics = modelData?.profiles.filter(
    (x) => x.name === trainingData.training?.profileDescription?.profile,
  )[0].script?.metrics;

  if (!profileMetrics || profileMetrics.length === 0)
    return <span>No top metric defined</span>;

  const topMetric = profileMetrics[0];
  return (
    <TrainingMetric
      runId={trainingData?.training?.run?.runId}
      metric={topMetric as MetricDefinition}
    />
  );
};

export default TrainingMetricsColumn;
