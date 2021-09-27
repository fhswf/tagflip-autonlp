import { useQuery } from '@apollo/client';
import { Card, Spin, Statistic } from 'antd';
import { MetricDefinition, MetricSet, RunStatus } from 'auto-nlp-shared-js';
import _ from 'lodash';
import moment from 'moment';
import React, { FunctionComponent } from 'react';
import Plot from 'react-plotly.js';
import { GetMetric } from '../../../../../apollo/__generated__/GetMetric';
import { GetTrainings_trainings } from '../../../../../apollo/__generated__/GetTrainings';
import { GET_METRIC } from '../../../../../apollo/trainings';

const COLORS = {
  [MetricSet.train]: '#2274d9',
  [MetricSet.eval]: '#ff6100',
  [MetricSet.test]: '#b300ff',
  ['default']: '#454545',
};

export const MetricCard: FunctionComponent<{
  training: GetTrainings_trainings;
  metric: MetricDefinition;
}> = (props) => {
  const { data: metric, loading: metricLoading } = useQuery<GetMetric>(
    GET_METRIC,
    {
      skip: !props.training,
      variables: {
        runId: props.training?.run?.runId,
        metric: props.metric.name,
      },
      pollInterval:
        [RunStatus.RUNNING, RunStatus.FINISHED].includes(
          props.training?.run?.status,
        ) && moment().isBefore(moment(props?.training.latestEndTime))
          ? 10 * 1000
          : 0,
    },
  );

  if (metricLoading) return <Spin spinning={true} />;

  const sortedSteps = _.sortBy(metric?.metricForRun?.steps, ['step']);

  if (sortedSteps.length === 0) return null;

  let value = metric?.metricForRun?.lastValue;
  if (typeof value === 'number' && value < 1e-4) {
    value = value.toExponential(props.metric.precision || 4);
  }

  return (
    <Card>
      <Statistic
        loading={metricLoading}
        title={metric?.metricForRun?.name}
        value={value}
        precision={props.metric.precision || 4}
      />
      <Plot
        data={[
          {
            x: [...sortedSteps?.map((x) => x.step)],
            y: [...sortedSteps?.map((x) => x.value)],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: COLORS[props.metric.set] || COLORS['default'] },
          },
        ]}
        style={{ width: '100%', height: '100%' }}
        layout={{
          autosize: true,
          title: props.metric.description
            ? `${props.metric.description}`
            : metric.metricForRun?.name,
          margin: {
            l: 50,
            r: 50,
            b: 30,
            t: 50,
            pad: 4,
          },
        }}
      />
    </Card>
  );
};
