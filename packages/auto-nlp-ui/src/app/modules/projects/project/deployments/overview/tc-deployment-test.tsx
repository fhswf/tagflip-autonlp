import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Card, Form, Input, Spin } from 'antd';
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

const NONE_ANNOTATION = 'O';

const SPECIAL_TOKEN_PATTERN = /\[.+]/;

const palette = [
  '#00c0ff',
  '#ffd63b',
  '#81baff',
  '#3dba2d',
  '#ff00a8',
  '#e4acf5',
  '#e4961b',
  '#85ff7b',
  '#ff005c',
  '#00ffed',
];

const TcDeploymentTest: FunctionComponent<Props> = (props) => {
  const {
    data: deploymentData,
    loading: deploymentLoading,
  } = useQuery<GetDeployment>(GET_DEPLOYMENT, {
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

    let currentToken = '';
    let currentAnnotation = '';

    const annotations = new Set<string>();

    const joinedTokens: Token[] = [];
    for (const [token, annotation] of result) {
      if (SPECIAL_TOKEN_PATTERN.test(token)) {
        console.log('Special token', token);
        continue;
      }
      if (token.startsWith('##')) {
        currentToken += token.substring(2);
      } else {
        if (currentToken) {
          joinedTokens.push({
            token: currentToken,
            annotation: currentAnnotation,
          });
        }
        currentToken = token;
        currentAnnotation = annotation;
        annotations.add(annotation);
      }
    }
    if (currentToken) {
      joinedTokens.push({
        token: currentToken,
        annotation: currentAnnotation,
      });
    }

    console.log(result, joinedTokens);

    const annotationToColor = new Map(
      [...annotations].sort().map((ann, index) => [
        ann.substring(2), // ignore B- /I-
        palette[index % palette.length],
      ]),
    );

    const components = [];
    let index = 0;
    for (const token of joinedTokens) {
      if (token.annotation === NONE_ANNOTATION)
        components.push(<span key={index++}>{token.token} </span>);
      else {
        components.push(
          <div
            className={classes.tagged}
            style={{
              backgroundColor: annotationToColor.get(
                token.annotation.substring(2),
              ),
            }}
            key={index++}
          >
            <div className={classes.ann}>{token.annotation}</div>
            <span>{token.token}</span>{' '}
          </div>,
        );
      }
    }
    return <Card className={classes.result}>{components}</Card>;
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
export default TcDeploymentTest;
