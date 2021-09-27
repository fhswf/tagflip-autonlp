import { CloseOutlined, LineChartOutlined } from '@ant-design/icons';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { BackTop, Button, Col, Modal, Row, Spin, Table, Tag } from 'antd';
import { Deployment } from 'auto-nlp-core/dist/modules/deployments/entities/deployment.entitiy';
import { DeploymentStatus } from 'auto-nlp-shared-js';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { GetDeployment } from '../../../../../apollo/__generated__/GetDeployment';
import { GetDeployments } from '../../../../../apollo/__generated__/GetDeployments';
import {
  GET_DEPLOYMENT,
  GET_DEPLOYMENTS,
  REMOVE_DEPLOYMENT,
} from '../../../../../apollo/deployments';
import TrainingMetricsColumn from '../../trainings/overview/training-metrics-column';
import DeploymentDetails from './deployment-details';

interface OwnProps {
  id: string;
}

type Props = OwnProps;

const DeploymentStatusColumn: FunctionComponent<Props> = (props) => {
  const {
    data: deploymentData,
    loading: deploymentLoading,
  } = useQuery<GetDeployment>(GET_DEPLOYMENT, {
    variables: {
      id: props.id,
    },
  });

  if (deploymentLoading) return <Spin spinning={true} />;

  switch (deploymentData?.deployment?.info?.status) {
    case DeploymentStatus.RUNNING:
      return <Tag color="blue">Running</Tag>;
    case DeploymentStatus.STOPPED:
      return <Tag color="red">Stopped</Tag>;
    case DeploymentStatus.FAILED:
      return <Tag color="red">Failed</Tag>;
    case DeploymentStatus.PENDING:
      return <Tag color="geekblue">Starting...</Tag>;
    default:
      return <Tag color="orange">Unknown</Tag>;
  }
};
export default DeploymentStatusColumn;
