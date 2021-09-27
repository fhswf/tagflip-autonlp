import { useQuery } from '@apollo/client';
import { List, PageHeader, Spin } from 'antd';
import { MetricDefinition, RunStatus } from 'auto-nlp-shared-js';
import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { GetMetrics } from '../../../../../apollo/__generated__/GetMetrics';
import { GetTraining } from '../../../../../apollo/__generated__/GetTraining';
import { GetTrainings_trainings } from '../../../../../apollo/__generated__/GetTrainings';
import { GET_METRICS, GET_TRAINING } from '../../../../../apollo/trainings';
import { MetricCard } from './metric-card';
import { ParameterCard } from './parameter-card';

interface OwnProps {
  training: GetTrainings_trainings;
}

type Props = OwnProps;

const TrainingDetails: FunctionComponent<Props> = (props) => {
  const {
    data: trainingData,
    loading: trainingLoading,
  } = useQuery<GetTraining>(GET_TRAINING, {
    variables: {
      trainingId: props.training.id,
    },
  });

  const { data: metrics, loading: metricsLoading } = useQuery<GetMetrics>(
    GET_METRICS,
    {
      skip: !props.training?.id,
      variables: {
        runId: props.training?.run?.runId,
      },
      pollInterval:
        [RunStatus.RUNNING, RunStatus.FINISHED].includes(
          props.training?.run?.status,
        ) && moment().isBefore(moment(props?.training.latestEndTime))
          ? 10 * 1000
          : 0,
    },
  );

  if (trainingLoading || metricsLoading) return <Spin spinning={true} />;

  const modelData = trainingData?.training?.model;
  const profileMetrics = modelData?.profiles
    .filter((x) => x.name === props?.training?.profileDescription?.profile)[0]
    .script?.metrics?.filter((x) =>
      metrics?.metricsForRun?.map((x) => x.name).includes(x.name),
    );

  let displayMetrics = profileMetrics?.map((x) => x as MetricDefinition);
  if (!displayMetrics)
    displayMetrics = metrics?.metricsForRun?.map(
      (x) => ({ name: x.name, description: x.name } as MetricDefinition),
    );

  return (
    <>
      <PageHeader
        title="Run"
        subTitle={`ID: ${trainingData?.training?.run?.runId}`}
      />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 3,
        }}
        loading={trainingLoading || metricsLoading}
        rowKey={(metric) => metric.name}
        dataSource={displayMetrics}
        renderItem={(metric) => (
          <List.Item>
            <MetricCard
              training={trainingData?.training}
              metric={metric as MetricDefinition}
            />
          </List.Item>
        )}
      />
      <ParameterCard run={trainingData?.training?.run} />
    </>
  );
};
export default TrainingDetails;
