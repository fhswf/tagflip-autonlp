import { PageHeader } from 'antd';
import React, { FunctionComponent } from 'react';
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
