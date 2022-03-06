import { useMutation, useQuery } from '@apollo/client';
import { Button, Form, Input, Modal, PageHeader, Spin } from 'antd';

import React from 'react';
import { useMatch } from 'react-router-dom';
import { CreateProject } from '../../../../apollo/__generated__/CreateProject';
import { GetProjectBase } from '../../../../apollo/__generated__/GetProjectBase';
import { GetTaskTypes } from '../../../../apollo/__generated__/GetTaskTypes';
import { GET_PROJECT_BASE, UPDATE_PROJECT } from '../../../../apollo/projects';
import { GET_TASK_TYPES } from '../../../../apollo/task-types';

const layout = {
  labelCol: { span: 4 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export const EditProject = () => {
  const [form] = Form.useForm();
  const match = useMatch('/project/:id/*');

  const {
    data: projectData,
    loading: projectDataLoading,
    error: projectDataError,
  } = useQuery<GetProjectBase>(GET_PROJECT_BASE, {
    variables: { projectId: match.params.id },
  });

  const {
    data: tasksData,
    loading: taskLoading,
    error: tasksError,
  } = useQuery<GetTaskTypes>(GET_TASK_TYPES);

  const [
    updateProject,
    { loading: updateLoading, error: updateError, data: updateData },
  ] = useMutation<CreateProject>(UPDATE_PROJECT, {
    refetchQueries: [
      {
        query: GET_PROJECT_BASE,
        variables: { projectId: projectData?.project.id },
      },
    ],
  });

  // if (projectDataLoading) return <Spin spinning={true} />;

  const onFinish = (values: any) => {
    console.log(values);
    updateProject({
      variables: {
        id: projectData?.project.id,
        data: values,
      },
    });
  };

  if (projectDataLoading || taskLoading) return <Spin spinning={true} />;

  if (updateError) {
    Modal.error({
      title: updateError.name,
      content: updateError.message,
      onOk() {},
    });
    return null;
  }

  if (projectDataError) {
    Modal.error({
      title: projectDataError.name,
      content: projectDataError.message,
      onOk() {},
    });
    return null;
  }

  return (
    <>
      <PageHeader title="Project Settings" />
      <Spin spinning={updateLoading}>
        <Form
          {...layout}
          initialValues={projectData?.project}
          form={form}
          name="editProjectForm"
          onFinish={onFinish}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder={'Insert a project name'} />
          </Form.Item>
          <Form.Item label="Task">
            {projectData?.project?.taskTypeName}
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Give a project description" />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Save changes
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};
