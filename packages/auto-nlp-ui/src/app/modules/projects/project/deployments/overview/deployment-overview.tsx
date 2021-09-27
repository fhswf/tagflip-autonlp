import { PageHeader } from 'antd';
import React, { FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import DeploymentTable from './deployment-table';

interface OwnProps {}

type Props = OwnProps;

const DeploymentOverview: FunctionComponent<Props> = (props) => {
  return (
    <>
      <PageHeader title="Deployments" subTitle="Overview" />
      <DeploymentTable />
    </>
  );
};

export default DeploymentOverview;
