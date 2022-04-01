import { Button, PageHeader } from 'antd';
import React, { FunctionComponent } from 'react';
import { ScheduleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import TrainingTable from './training-table';

interface OwnProps {}

type Props = OwnProps;

const TrainingOverview: FunctionComponent<Props> = (props) => {
  const location = ""; //useLocation();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Trainings"
        subTitle="Overview"
        extra={[
          <Button
            key="plan-training"
            type="primary"
            onClick={() => navigate(location.pathname + '/new')}
          >
            <ScheduleOutlined /> Plan new
          </Button>,
        ]}
      />
      <TrainingTable />
    </>
  );
};

export default TrainingOverview;
