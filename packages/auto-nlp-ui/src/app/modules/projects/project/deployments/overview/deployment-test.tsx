import { useQuery } from '@apollo/client';
import { Card, Collapse, Descriptions, PageHeader, Spin } from 'antd';
import { TaskType } from 'auto-nlp-shared-js';
import React, { FunctionComponent } from 'react';
import { useMatch } from 'react-router-dom';
import { GetDeployment } from '../../../../../apollo/__generated__/GetDeployment';
import { GetProjectBase } from '../../../../../apollo/__generated__/GetProjectBase';
import { GET_DEPLOYMENT } from '../../../../../apollo/deployments';
import { GET_PROJECT_BASE } from '../../../../../apollo/projects';
import TcDeploymentTest from './tc-deployment-test';

interface OwnProps {
  deploymentId: string;
}

type Props = OwnProps;

const DeploymentTest: FunctionComponent<Props> = (props) => {
  let match = useMatch('/project/:id/*');
  const { data: projectData, loading: projectLoading } =
    useQuery<GetProjectBase>(GET_PROJECT_BASE, {
      variables: { projectId: match.params.id },
    });

  if (projectLoading) return <Spin spinning={true} />;

  const renderTestComponent = () => {
    const taskType = projectData?.project?.taskType as TaskType;
    switch (taskType) {
      case TaskType.Token_Classification:
        return <TcDeploymentTest deploymentId={props.deploymentId} />;
    }
  };

  return <Card>{renderTestComponent()}</Card>;
};
export default DeploymentTest;
