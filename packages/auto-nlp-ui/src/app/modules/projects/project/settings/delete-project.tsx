import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, Modal, PageHeader, Spin } from 'antd';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CreateProject } from '../../../../apollo/__generated__/CreateProject';
import { GetDeploymentCount } from '../../../../apollo/__generated__/GetDeploymentCount';
import { GET_DEPLOYMENT_COUNT } from '../../../../apollo/deployments';
import {
  DELETE_PROJECT,
  GET_PROJECT_BASE,
  GET_PROJECTS,
} from '../../../../apollo/projects';

export const DeleteProject = () => {
  const match = useRouteMatch<{ id: string }>('/project/:id');
  const history = useHistory();

  const {
    data: projectData,
    loading: projectDataLoading,
    error: projectDataError,
  } = useQuery(GET_PROJECT_BASE, {
    variables: { projectId: match.params.id },
  });

  const {
    data: deploymentCount,
    loading: deploymentCountLoading,
    error: deploymentCountError,
  } = useQuery<GetDeploymentCount>(GET_DEPLOYMENT_COUNT, {
    variables: { projectId: match.params.id },
  });

  const [
    deleteProject,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation<CreateProject>(DELETE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const onDelete = () => {
    Modal.confirm({
      title: `Do you really want to delete project '${projectData?.project.name}'?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. Be sure!',
      onOk() {
        deleteProject({
          variables: {
            id: projectData?.project.id,
          },
        }).then(() => history.replace('/project'));
      },
      onCancel() {},
    });
  };

  if (projectDataLoading || deploymentCountLoading)
    return <Spin spinning={true} />;

  if (deleteError)
    Modal.error({
      title: deleteError.name,
      content: deleteError.message,
      onOk() {},
    });

  if (projectDataError)
    Modal.error({
      title: projectDataError.name,
      content: projectDataError.message,
      onOk() {},
    });

  if (deploymentCountError)
    Modal.error({
      title: deploymentCountError.name,
      content: deploymentCountError.message,
      onOk() {},
    });

  return (
    <>
      <PageHeader title="Danger Zone" />
      <Spin spinning={deleteLoading}>
        <Alert
          message="Delete Project"
          showIcon
          description={
            <>
              {
                "Once you delete this project, there is no option to recover. Be certain about what you're doing."
              }
              {deploymentCount?.deploymentsCount > 0 && (
                <Alert
                  message="Option disabled"
                  description="The project cannot be deleted until all deployments have been revoked manually."
                  type="error"
                />
              )}
            </>
          }
          type="warning"
          action={
            <>
              <Button
                type="primary"
                ghost={true}
                onClick={onDelete}
                danger
                disabled={deploymentCount?.deploymentsCount > 0}
              >
                Delete Project
              </Button>
            </>
          }
        />
      </Spin>
    </>
  );
};
