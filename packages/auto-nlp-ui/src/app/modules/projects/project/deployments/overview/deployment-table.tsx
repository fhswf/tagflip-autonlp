import { CloseOutlined, LineChartOutlined } from '@ant-design/icons';
import { useLazyQuery, useMutation } from '@apollo/client';
import { BackTop, Button, Col, Modal, Row, Table, Tag } from 'antd';
import { Deployment } from 'auto-nlp-core/dist/modules/deployments/entities/deployment.entitiy';
import { DeploymentStatus } from 'auto-nlp-shared-js';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { GetDeployments } from '../../../../../apollo/__generated__/GetDeployments';
import {
  GET_DEPLOYMENTS,
  REMOVE_DEPLOYMENT,
} from '../../../../../apollo/deployments';
import TrainingMetricsColumn from '../../trainings/overview/training-metrics-column';
import DeploymentDetails from './deployment-details';
import DeploymentStatusColumn from './deployment-status-column';

interface OwnProps {}

type Props = OwnProps;

const DeploymentTable: FunctionComponent<Props> = (props) => {
  let match = useRouteMatch<{ id: string }>('/project/:id/');

  const [
    getDeployments,
    { data, loading, error },
  ] = useLazyQuery<GetDeployments>(GET_DEPLOYMENTS, {
    pollInterval: 30 * 1000,
    fetchPolicy: 'network-only',
  });

  const [removeDeployment, { loading: removeDeploymentLoading }] = useMutation<{
    id: string;
  }>(REMOVE_DEPLOYMENT);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const renderActions = (deployment) => {
    const status: DeploymentStatus = deployment.info?.status;

    const actions = [];
    if (
      [
        DeploymentStatus.RUNNING,
        DeploymentStatus.FAILED,
        DeploymentStatus.STOPPED,
      ].includes(status)
    ) {
      actions.push(
        <Button
          type="ghost"
          key="delete"
          size="small"
          danger
          onClick={() =>
            Modal.confirm({
              title: `Are you sure you want to undeploy ${deployment.info.deploymentId}?`,
              onOk: () =>
                removeDeployment({ variables: { id: deployment.id } }).then(
                  () =>
                    getDeployments({
                      variables: {
                        projectId: match.params.id,
                        limit: pagination.pageSize,
                        offset: (pagination.current - 1) * pagination.pageSize,
                      },
                    }),
                ),
            })
          }
        >
          <CloseOutlined />
        </Button>,
      );
    }

    return actions;
  };

  const columns = [
    {
      title: 'Deployment',
      dataIndex: ['deploymentId'],
    },
    {
      title: 'Run',
      dataIndex: ['run', 'runId'],
    },
    {
      title: 'Model',
      dataIndex: ['run', 'training', 'model', 'name'],
      width: '15%',
    },
    {
      title: 'Profile',
      dataIndex: ['run', 'training', 'profileDescription', 'profile'],
      width: '15%',
    },
    {
      title: 'Deployment Runtime',
      dataIndex: ['runtimeDescription', 'runtime'],
      width: '15%',
    },
    {
      title: 'Quality',
      fixed: 'right',
      width: '180px',
      render: (_, deployment) => (
        <Row justify="space-between" align="middle">
          <Col>
            {deployment.run.training && (
              <TrainingMetricsColumn trainingId={deployment.run.training.id} />
            )}
            {!deployment.run.training && (
              <Button
                key="dashboard"
                type="ghost"
                size="small"
                onClick={() =>
                  window.open(deployment.run.dashboardUrl, '_blank')
                }
              >
                <LineChartOutlined />
              </Button>
            )}
          </Col>
        </Row>
      ),
    },

    {
      title: 'Status',
      width: '90px',
      fixed: 'right',
      render: (deployment) => {
        return <DeploymentStatusColumn id={deployment.id} />;
      },
      filters: Object.keys(DeploymentStatus).map((x) => {
        return { text: x, value: x };
      }),
      onFilter: (value, record) => record?.info?.status === value,
    },

    {
      title: '',
      fixed: 'right',
      width: '60px',
      render: (_, record) => renderActions(record),
    },
  ];

  useEffect(() => {
    getDeployments({
      variables: {
        projectId: match.params.id,
      },
    });
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    getDeployments({
      variables: {
        projectId: match.params.id,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
      },
    });
    setPagination({
      ...pagination,
    });
  };

  if (error) {
    Modal.error({
      title: error.name,
      content: error.message,
      onOk() {},
    });
    return null;
  }

  const renderExpandable = (deployment) => {
    if (deployment.info.status === DeploymentStatus.RUNNING) {
      return <DeploymentDetails id={deployment.id} />;
    }
  };

  return (
    <>
      <BackTop />
      <Table
        bordered
        scroll={{ x: 1500 }}
        columns={columns as undefined}
        rowKey={(record) => record.id}
        dataSource={data?.deployments || []}
        expandable={{
          expandedRowRender: renderExpandable,
          rowExpandable: (deployment) =>
            [DeploymentStatus.RUNNING].includes(deployment.info.status),
        }}
        pagination={{ ...pagination, total: data?.deploymentsCount }}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
};
export default DeploymentTable;
