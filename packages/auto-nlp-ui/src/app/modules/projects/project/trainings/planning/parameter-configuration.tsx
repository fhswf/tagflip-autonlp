import { useQuery } from '@apollo/client';
import {
  Alert,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Spin,
  Typography,
} from 'antd';
import { ParameterDefinition } from 'auto-nlp-shared-js';

import React, { FunctionComponent } from 'react';
import { GetModel } from '../../../../../apollo/__generated__/GetModel';
import { GET_MODEL } from '../../../../../apollo/models';
import FormHelp from '../../../../../components/form-help';
import { formData } from './index';

interface OwnProps {
  formName: string;
}

type Props = OwnProps;

const ParameterConfiguration: FunctionComponent<Props> = (props) => {
  const [form] = Form.useForm();
  const modelId = formData().model;
  const profileId = formData().profileDescription.profile;

  const {
    data: modelData,
    loading: modelLoading,
    error: modelError,
  } = useQuery<GetModel>(GET_MODEL, {
    skip: !modelId,
    variables: {
      modelId: modelId,
    },
  });

  if (modelLoading) return <Spin spinning={true} />;

  if (modelError) {
    Modal.error({
      title: modelError.name,
      content: modelError.message,
      onOk() {},
    });
    return null;
  }

  const profile = modelData?.model?.profiles?.filter(
    (x) => x.name === profileId,
  )[0];

  const renderParameterFormItem = (
    category: string,
    parameter: ParameterDefinition,
  ) => {
    const defaultValue = parameter.default;
    const fieldName = [category, parameter.name];

    return (
      <FormHelp
        key={parameter.name}
        help={parameter.description || 'No description.'}
      >
        <Form.Item
          name={fieldName}
          label={parameter.name}
          shouldUpdate={(prevValues, curValues) =>
            prevValues.profile !== curValues.profile
          }
          rules={[{ required: true }]}
        >
          {(typeof defaultValue === 'string' ||
            typeof defaultValue === 'number') && (
            <Input
              placeholder={`Define value for ${parameter.name}`}
              type={typeof defaultValue}
            />
          )}
        </Form.Item>
      </FormHelp>
    );
  };

  const initialValues = {
    ['hyperParameters']:
      formData().profileDescription.hyperParameters ||
      Object.fromEntries(
        profile?.script?.hyperParameters?.map((x) => [x.name, x.default]) || [],
      ),
    ['trainingParameters']:
      formData().profileDescription.trainingParameters ||
      Object.fromEntries(
        profile?.script?.trainingParameters?.map((x) => [x.name, x.default]) ||
          [],
      ),
  };

  const renderFormContent = () => {
    if (!profile.script.hyperParameters && !profile.script.trainingParameters) {
      return (
        <Typography.Paragraph>
          <Alert
            type="success"
            message="No parameter configuration required"
            description="Your selected training profile does not require any configuration. Just move on."
          />
        </Typography.Paragraph>
      );
    }

    return (
      <>
        {profile?.script?.hyperParameters && (
          <Divider orientation="left">Hyper-Parameters</Divider>
        )}
        {profile?.script?.hyperParameters?.map((x) =>
          renderParameterFormItem('hyperParameters', x as ParameterDefinition),
        )}

        {profile?.script?.trainingParameters && (
          <Divider orientation="left">Training-Parameters</Divider>
        )}
        {profile?.script?.trainingParameters?.map((x) =>
          renderParameterFormItem(
            'trainingParameters',
            x as ParameterDefinition,
          ),
        )}
      </>
    );
  };

  return (
    <Form
      {...{
        labelCol: { sm: { span: 16 }, md: { span: 10 } },
      }}
      initialValues={initialValues}
      form={form}
      name={props.formName}
    >
      <Typography.Paragraph>
        <Alert
          type="info"
          message="Parameter configuration"
          description="A profile offers the possibility to set hyper-parameters and training parameters.
          Changes in hyper-parameters have a potentially high impact on the prediction quality of the trained model.
          Training parameters control the training process and the reporting of the training. "
        />
      </Typography.Paragraph>
      {renderFormContent()}
    </Form>
  );
};

export default ParameterConfiguration;
