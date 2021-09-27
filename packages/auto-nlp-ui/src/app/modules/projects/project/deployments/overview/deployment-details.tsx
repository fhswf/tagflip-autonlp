import { useQuery } from '@apollo/client';
import { Card, Col, Descriptions, PageHeader, Row, Spin } from 'antd';
import React, { FunctionComponent } from 'react';
import { GetDeployment } from '../../../../../apollo/__generated__/GetDeployment';
import { GET_DEPLOYMENT } from '../../../../../apollo/deployments';
import DeploymentTest from './deployment-test';

interface OwnProps {
  id: string;
}

type Props = OwnProps;

const DeploymentDetails: FunctionComponent<Props> = (props) => {
  const {
    data: deploymentData,
    loading: deploymentLoading,
  } = useQuery<GetDeployment>(GET_DEPLOYMENT, {
    variables: {
      id: props.id,
    },
  });

  if (deploymentLoading) return <Spin spinning={true} />;

  return (
    <>
      <PageHeader
        title="Deployment"
        subTitle={`ID: ${deploymentData?.deployment?.info?.deploymentId}`}
      />

      <Card>
        <Row>
          <Col flex={0.5}>
            <Descriptions
              title="Endpoint"
              column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label={'URL'}>
                {deploymentData?.deployment?.info.endpoint.url}
              </Descriptions.Item>
              <Descriptions.Item label={'HTTP-Method'}>
                {deploymentData?.deployment?.info.endpoint.method}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col flex="auto">
            {deploymentData?.deployment?.info?.proxyEndpoint && (
              <Descriptions
                title="Proxy-Endpoint"
                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label={'URL'}>
                  {deploymentData?.deployment?.info?.proxyEndpoint.url}
                </Descriptions.Item>
                <Descriptions.Item label={'HTTP-Method'}>
                  {deploymentData?.deployment?.info?.proxyEndpoint.method}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Col>
        </Row>
      </Card>
      <DeploymentTest deploymentId={deploymentData?.deployment.id} />
    </>
  );
};
export default DeploymentDetails;
