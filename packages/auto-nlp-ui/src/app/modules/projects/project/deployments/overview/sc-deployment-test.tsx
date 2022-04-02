import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Card, Col, Form, Input, Row, Spin, Table } from 'antd';
import React, { FunctionComponent } from 'react';
import { createUseStyles } from 'react-jss';
import { GetDeployment } from '../../../../../apollo/__generated__/GetDeployment';
import { TestDeployment } from '../../../../../apollo/__generated__/TestDeployment';
import {
  GET_DEPLOYMENT,
  TEST_DEPLOYMENT,
} from '../../../../../apollo/deployments';

interface OwnProps {
  deploymentId: string;
}

type Props = OwnProps;
type Token = { token: string; annotation: string };

const useStyles = createUseStyles({
  result: {
    fontSize: '1.0rem',
  },
  tagged: {
    display: 'inline-block',
    padding: 2,
    border: '1px solid #000',
    borderRadius: 4,
    margin: '0 5px 3px 5px',
  },
  ann: {
    display: 'inline-block',
    background: 'white',
    border: '1px solid #000',
    borderRadius: '4px',
    margin: '0 3px 1px 0px',
    padding: 1,
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    verticalAlign: 'middle',
  },
});

const ScDeploymentTest: FunctionComponent<Props> = (props) => {
  const { data: deploymentData, loading: deploymentLoading } =
    useQuery<GetDeployment>(GET_DEPLOYMENT, {
      variables: {
        id: props.deploymentId,
      },
    });

  const [
    testDeployment,
    { data: testDeploymentData, loading: testDeploymentDataLoading },
  ] = useLazyQuery<TestDeployment>(TEST_DEPLOYMENT);

  if (deploymentLoading) return <Spin spinning={true} />;

  const onFinish = (values: any) => {
    testDeployment({
      variables: {
        id: props.deploymentId,
        input: [values.input],
      },
    });
  };

  const classes = useStyles();

  const renderResults = () => {
    if (testDeploymentDataLoading) return <Spin spinning={true} />;

    if (!testDeploymentData) return null;

    const result = testDeploymentData.testDeployment[0];
    result.key = '1';

    const data = [ result ];

    console.log('result: %o', result);

    const columns = [
      { title: 'Text', dataIndex: 'text', key: 'text' },
      { title: 'Label', dataIndex: 'label', key: 'label' },
      { title: 'Score', dataIndex: 'score', key: 'score' },
    ];

    return <Table dataSource={data} columns={columns} />;
  };

  return (
    <>
      <Form
        id={'form-test-' + deploymentData.deployment.id}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name={'input'}
          label="Give a sample"
          rules={[{ required: true }]}
        >
          <Input.TextArea size="large" rows={6} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={testDeploymentDataLoading}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
      {renderResults()}
    </>
  );
};
export default ScDeploymentTest;
