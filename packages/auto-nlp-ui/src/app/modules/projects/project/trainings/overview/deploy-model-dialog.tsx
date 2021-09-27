import { useMutation, useQuery } from '@apollo/client';
import { Card, Divider, Form, Modal, Select, Spin } from 'antd';
import { CreateDeploymentInput } from 'auto-nlp-core/dist/modules/deployments/dto/create-deployment.input';
import { ParameterDefinition } from 'auto-nlp-shared-js';
import React, { FunctionComponent, useState } from 'react';
import { GetDeploymentRuntimes } from '../../../../../apollo/__generated__/GetDeploymentRuntimes';
import { GetTraining } from '../../../../../apollo/__generated__/GetTraining';
import { CREATE_DEPLOYMENT } from '../../../../../apollo/deployments';
import { GET_DEPLOYMENT_RUNTIME_ENVIRONMENTS } from '../../../../../apollo/runtime-environments';
import { GET_TRAINING } from '../../../../../apollo/trainings';
import FormHelp from '../../../../../components/form-help';
import ParameterFormItem from '../../../../../components/parameter-form-item';

interface OwnProps {
  trainingId: string;
  visible: boolean;
  onSubmitted: () => any;
  onCancel: () => any;
}

type Props = OwnProps;

const DeployModelDialog: FunctionComponent<Props> = (props) => {
  const [form] = Form.useForm();
  const [selectedRuntime, setSelectedRuntime] = useState(undefined);

  const {
    data: runtimes,
    loading: runtimesLoading,
    error: runtimesLoadingError,
  } = useQuery<GetDeploymentRuntimes>(GET_DEPLOYMENT_RUNTIME_ENVIRONMENTS, {
    skip: !props.visible,
  });

  const {
    data: trainingData,
    loading: trainingLoading,
    error: trainingLoadingError,
  } = useQuery<GetTraining>(GET_TRAINING, {
    skip: !props.trainingId,
    variables: {
      trainingId: props.trainingId,
    },
  });

  const [
    createDeployment,
    { loading: createDeploymentLoading },
  ] = useMutation<CreateDeploymentInput>(CREATE_DEPLOYMENT);

  const onCancel = () => {
    props.onCancel();
  };

  const onSubmit = (values) => {
    createDeployment({
      variables: {
        data: {
          run: trainingData?.training?.run.id,
          runtimeDescription: {
            runtime: values.runtime.name,
            parameters: values.runtime.parameters,
          },
        },
      },
    }).then((r) => {
      form.resetFields();
      props.onSubmitted();
    });
  };

  if (trainingLoadingError) {
    Modal.error({
      title: trainingLoadingError.name,
      content: trainingLoadingError.message,
      onOk() {},
    });
    return null;
  }

  if (runtimesLoadingError) {
    Modal.error({
      title: runtimesLoadingError.name,
      content: runtimesLoadingError.message,
      onOk() {},
    });
    return null;
  }

  const reset = () => {
    setSelectedRuntime(undefined);
    form.resetFields([['runtime']]);
  };

  const onSelectRuntime = (value) => {
    setSelectedRuntime(
      runtimes?.deploymentRuntimeEnvironments?.filter(
        (x) => x.name === value,
      )[0],
    );
  };

  const renderForm = () => {
    const parameterDefinitions = selectedRuntime?.parameters;

    return (
      <Form form={form} layout="vertical" name="form_in_modal">
        <Divider orientation="left">Select runtime environment</Divider>
        <FormHelp help="You have to select a runtime where the model will be deployed to.">
          <Form.Item
            name={['runtime', 'name']}
            label="Runtime environment"
            rules={[{ required: true }]}
          >
            <Select
              loading={runtimesLoading}
              onChange={onSelectRuntime}
              optionLabelProp="value"
            >
              {runtimes?.deploymentRuntimeEnvironments.map((x) => (
                <Select.Option
                  key={x.name}
                  value={x.name}
                  title={x.description}
                >
                  <Card
                    title={`${x.name} (${x.type})`}
                    size="small"
                    bordered={false}
                  >
                    {x.description || 'No description.'}
                  </Card>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </FormHelp>
        {selectedRuntime && (
          <>
            <Divider orientation="left">Runtime parameters</Divider>
            {parameterDefinitions?.map((x) => (
              <ParameterFormItem
                key={x.name}
                namePrefix={['runtime', 'parameters']}
                parameter={x as ParameterDefinition}
                withHelp
              />
            ))}
          </>
        )}
      </Form>
    );
  };

  const loading = runtimesLoading || trainingLoading || createDeploymentLoading;

  return (
    <Modal
      destroyOnClose={true}
      visible={props.visible}
      title="Deploy Model"
      okText="Deploy"
      cancelText="Cancel"
      onCancel={onCancel}
      afterClose={reset}
      width={800}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onSubmit(values);
          })
          .catch(() => {});
      }}
    >
      {loading && <Spin spinning={true} />}
      {!loading && renderForm()}
    </Modal>
  );
};

export default DeployModelDialog;
