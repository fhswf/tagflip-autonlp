import { useMutation, useQuery } from '@apollo/client';
import { Button, Form, Input, Modal, Select, Spin } from 'antd';
import React, { FunctionComponent } from 'react';
import { CreateProject } from '../../../apollo/__generated__/CreateProject';
import { GetTaskTypes } from '../../../apollo/__generated__/GetTaskTypes';
import { CREATE_PROJECT, GET_PROJECTS } from '../../../apollo/projects';
import { GET_TASK_TYPES } from '../../../apollo/task-types';

interface OwnProps {
  show: boolean;
  onClose: () => any;
}

type Props = OwnProps;

const NewProject: FunctionComponent<Props> = (props) => {
  const { Option } = Select;
  const [form] = Form.useForm();

  const {
    data: tasksData,
    loading: taskLoading,
    error: tasksError,
  } = useQuery<GetTaskTypes>(GET_TASK_TYPES);
  const [
    createProject,
    { loading: createProjectLoading, error: createProjectError },
  ] = useMutation<CreateProject>(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const onFinish = (values: any) => {
    console.log(values);
    createProject({
      variables: {
        data: values,
      },
    })
      .then(() => form.resetFields())
      .then(() => props.onClose());
  };

  const handleOk = (values: any) => {};

  const handleCancel = () => {
    props.onClose();
  };

  const onReset = () => {
    form.resetFields();
  };

  const onTaskChange = (option) => {
    form.setFieldsValue({ task: option });
  };

  const renderFormContent = () => {
    return (
      <Spin spinning={taskLoading || createProjectLoading}>
        <h3>New Project</h3>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder={'Insert a project name'} />
        </Form.Item>
        <Form.Item name="taskType" label="Task" rules={[{ required: true }]}>
          <Select
            placeholder="Select the project's  task"
            onChange={onTaskChange}
            allowClear
          >
            {tasksData &&
              tasksData.taskTypes &&
              tasksData.taskTypes.map((x) => (
                <Option key={x.id} value={x.id}>
                  {x.label}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Give a project description" />
        </Form.Item>
      </Spin>
    );
  };

  const renderFormButtons = () => {
    return (
      <>
        <Button
          form="newProjectForm"
          type="primary"
          htmlType="submit"
          onClick={handleOk}
        >
          Submit
        </Button>
        <Button form="newProjectForm" htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </>
    );
  };

  if (tasksError) {
    Modal.error({
      title: tasksError.name,
      content: tasksError.message,
      onOk() {},
    });
    return null;
  }

  if (createProjectError) {
    Modal.error({
      title: createProjectError.name,
      content: createProjectError.message,
      onOk() {},
    });
    return null;
  }

  return (
    <Modal
      visible={props.show}
      footer={[renderFormButtons()]}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      width={600}
    >
      <Form
        {...{
          labelCol: { span: 4 },
        }}
        preserve={false}
        form={form}
        name="newProjectForm"
        onFinish={onFinish}
      >
        {renderFormContent()}
      </Form>
    </Modal>
  );
};
export default NewProject;
