import { useQuery } from '@apollo/client';
import { Card, Collapse, Descriptions, Spin } from 'antd';
import { Run, RunStatus } from 'auto-nlp-shared-js';
import React, { FunctionComponent } from 'react';
import { GetRunParameters } from '../../../../../apollo/__generated__/GetRunParameters';
import { GET_RUN_PARAMETERS } from '../../../../../apollo/trainings';

export const ParameterCard: FunctionComponent<{
  run: Run<any>;
}> = (props) => {
  const {
    data: parameterInfo,
    loading: parameterInfoLoading,
    error: parameterInfoError,
  } = useQuery<GetRunParameters>(GET_RUN_PARAMETERS, {
    fetchPolicy: 'no-cache',
    skip: !props.run,
    variables: {
      runId: props.run?.runId,
    },
    pollInterval: props.run?.status === RunStatus.RUNNING ? 60 * 1000 : 0,
  });

  if (parameterInfoLoading) return <Spin spinning={true} />;

  const parameters = parameterInfo?.runParameters?.parameters;
  if (!parameters) return null;

  return (
    <Card>
      <Collapse ghost>
        <Collapse.Panel header="Parameters" key="Parameters">
          <Descriptions
            title="Parameters"
            column={{ xxl: 4, xl: 4, lg: 4, md: 4, sm: 2, xs: 1 }}
          >
            {Object.entries(parameters).map(([k, v]) => {
              return (
                <Descriptions.Item key={k} label={k}>
                  {v}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};
