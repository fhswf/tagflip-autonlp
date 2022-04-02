import {
  CloseOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import {
  BackTop,
  Button,
  Col,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { RunStatus } from 'auto-nlp-shared-js';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { DeleteTraining } from '../../../../../apollo/__generated__/DeleteTraining';
import {
  GetTrainings,
  GetTrainings_trainings,
} from '../../../../../apollo/__generated__/GetTrainings';
import {
  CANCEL_RUN,
  DELETE_TRAINING,
  GET_TRAININGS,
} from '../../../../../apollo/trainings';
import DeployModelDialog from './deploy-model-dialog';
import TrainingDetails from './training-details';
import TrainingMetricsColumn from './training-metrics-column';
import { CancelRun } from '../../../../../apollo/__generated__/CancelRun';

interface OwnProps {}

type Props = OwnProps;

const TrainingTable: FunctionComponent<Props> = (props) => {
  const match = useMatch('/project/:id/*');
  const navigate = useNavigate();

  const [getTrainings, { data, loading, error }] = useLazyQuery<GetTrainings>(
    GET_TRAININGS,
    {
      fetchPolicy: 'network-only',
      pollInterval: 1000 * 15,
    },
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [deployableTrainingId, setDeployableTraining] = useState(undefined);

  const [deleteTraining, {}] = useMutation<DeleteTraining>(DELETE_TRAINING);

  const [cancelRun, {}] = useMutation<CancelRun>(CANCEL_RUN);

  const renderModelActions = (training: GetTrainings_trainings) => {
    const actions = [];
    if (training.run?.status === RunStatus.FINISHED) {
      actions.push(
        <Button
          key="deploy"
          type="primary"
          ghost
          size="small"
          onClick={() => setDeployableTraining(training.id)}
        >
          <CloudUploadOutlined /> Deploy
        </Button>,
      );
    }

    if (training.run) {
      actions.push(
        <Button
          key="dashboard"
          type="ghost"
          size="small"
          onClick={() => window.open(training.run?.dashboardUrl, '_blank')}
        >
          <LineChartOutlined />
        </Button>,
      );
    }

    return <Space>{actions}</Space>;
  };

  const renderRemoveActions = (training: GetTrainings_trainings) => {
    const actions = [];

    if (
      [
        RunStatus.FAILED,
        RunStatus.KILLED,
        RunStatus.UNKNOWN,
        RunStatus.FINISHED,
      ].includes(training.run?.status) ||
      (RunStatus.SCHEDULED &&
        moment().isBefore(moment(training.earliestStartTime))) ||
      (!training.run && moment().isAfter(moment(training.latestEndTime)))
    ) {
      actions.push(
        <Button
          type="ghost"
          key="delete"
          size="small"
          danger
          onClick={() =>
            Modal.confirm({
              title: `Are you sure you want to delete the training?`,
              onOk: () =>
                deleteTraining({ variables: { id: training.id } }).then(() =>
                  getTrainings({
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
          <DeleteOutlined />
        </Button>,
      );
    }
    if (training.run?.status === RunStatus.RUNNING) {
      actions.push(
        <Button
          type="ghost"
          key="cancel"
          size="small"
          danger
          onClick={() =>
            Modal.confirm({
              title: `Are you sure you want to cancel the training?`,
              onOk: () =>
                cancelRun({
                  variables: {
                    runId: training.run?.runId,
                  },
                }).then(() =>
                  getTrainings({
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
    return <Space>{actions}</Space>;
  };

  const columns = [
    {
      title: 'Model',
      dataIndex: ['model', 'name'],
      width: '10%',
    },
    {
      title: 'Profile',
      dataIndex: ['profileDescription', 'profile'],
      width: '10%',
    },
    {
      title: 'Runtime',
      dataIndex: ['runtimeDescription', 'runtime'],
      width: '10%',
    },
    {
      title: 'Training Time',
      width: '15%',
      children: [
        {
          title: 'from',
          dataIndex: 'earliestStartTime',
          render: (date) => {
            return moment(date).format('LLL');
          },
        },
        {
          title: 'to (max.)',
          dataIndex: 'latestEndTime',
          render: (date) => {
            return moment(date).format('LLL');
          },
        },
      ],
    },
    {
      title: 'Status',
      width: '90px',
      dataIndex: ['run', 'status'],
      render: (status: RunStatus, training) => {
        const getTag = () => {
          switch (status) {
            case RunStatus.RUNNING:
              return <Tag color="blue">Running</Tag>;
            case RunStatus.FAILED:
              return <Tag color="red">Failed</Tag>;
            case RunStatus.KILLED:
              return <Tag color="red">Killed</Tag>;
            case RunStatus.FINISHED:
              return <Tag color="green">Finished</Tag>;
            case RunStatus.UNKNOWN:
              return <Tag color="volcano">Unknown</Tag>;
            case RunStatus.CANCELLING:
              return <Tag color="purple">Cancelling</Tag>;
            case RunStatus.SCHEDULED:
            default:
              if (moment().isBefore(moment(training.earliestStartTime))) {
                return <Tag color="cyan">Scheduled</Tag>;
              }
              if (moment().isBefore(moment(training.latestEndTime))) {
                if (training.queueMessageId)
                  return <Tag color="orange">Enqueued</Tag>;
                return <Tag color="geekblue">Starting...</Tag>;
              }
              return <Tag color="magenta">Expired</Tag>;
          }
        };
        return getTag();
      },
      filters: Object.keys(RunStatus).map((x) => {
        return { text: x, value: x };
      }),
      onFilter: (value, record) =>
        record.run?.status === value ||
        (value === RunStatus.SCHEDULED && !record.run),
    },
    {
      title: 'Run',
      width: '17%',
      render: (_, training) => (
        <Typography.Text ellipsis={true}>
          {training?.run?.runId}
        </Typography.Text>
      ),
    },
    {
      title: 'Quality',
      fixed: 'right',
      width: '180px',
      render: (_, training) =>
        training.run?.status === RunStatus.FINISHED ? (
          <Row justify="space-between" align="middle">
            <Col>
              <TrainingMetricsColumn trainingId={training.id} />
            </Col>
          </Row>
        ) : null,
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: '150px',
      render: (_, record) => renderModelActions(record),
    },
    {
      title: '',
      width: '60px',
      fixed: 'right',
      render: (_, record) => renderRemoveActions(record),
    },
  ];

  useEffect(() => {
    getTrainings({
      variables: {
        projectId: match.params.id,
      },
    });
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    getTrainings({
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
      onOk() {
        console.log('ok');
      },
    });
    return null;
  }

  const renderExpandable = (training) => {
    return [RunStatus.FINISHED, RunStatus.RUNNING] ? (
      <TrainingDetails training={training} />
    ) : null;
  };

  return (
    <>
      <BackTop />
      <Table
        bordered
        scroll={{ x: 1500 }}
        columns={columns as undefined}
        rowKey={(record) => record.id}
        dataSource={data?.trainings || []}
        expandable={{
          expandedRowRender: renderExpandable,
          rowExpandable: (training) =>
            [
              RunStatus.FINISHED,
              RunStatus.RUNNING,
              RunStatus.CANCELLING,
            ].includes(training.run?.status),
        }}
        pagination={{ ...pagination, total: data?.trainingsCount }}
        loading={loading}
        onChange={handleTableChange}
      />
      <DeployModelDialog
        trainingId={deployableTrainingId}
        visible={deployableTrainingId}
        onSubmitted={async () => {
          setDeployableTraining(null);
          console.log(
            'navigating to %s',
            `/project/${match.params.id}/deployment`,
          );
          navigate(`/project/${match.params.id}/deployment`);
        }}
        onCancel={() => setDeployableTraining(null)}
      />
    </>
  );
};

export default TrainingTable;
