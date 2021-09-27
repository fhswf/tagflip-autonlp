import { useLazyQuery, useQuery } from '@apollo/client';
import {
  Alert,
  Card,
  DatePicker,
  Divider,
  Form,
  Modal,
  Select,
  Spin,
  Typography,
} from 'antd';
import { ParameterDefinition } from 'auto-nlp-shared-js';
import * as moment from 'moment';

import React, { FunctionComponent } from 'react';
import { GetModel } from '../../../../../apollo/__generated__/GetModel';
import { GetTrainingRuntimeByName } from '../../../../../apollo/__generated__/GetTrainingRuntimeByName';
import { GetTrainingRuntimes } from '../../../../../apollo/__generated__/GetTrainingRuntimes';
import { GET_MODEL } from '../../../../../apollo/models';
import {
  GET_TRAINING_RUNTIME_BY_NAME,
  GET_TRAINING_RUNTIMES,
} from '../../../../../apollo/runtime-environments';
import FormHelp from '../../../../../components/form-help';
import ParameterFormItem from '../../../../../components/parameter-form-item';
import { formData } from './index';

const { RangePicker } = DatePicker;

interface OwnProps {
  formName: string;
}

type Props = OwnProps;

const ScheduleTraining: FunctionComponent<Props> = (props) => {
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

  const {
    data: runtimesData,
    loading: runtimesLoading,
    error: runtimesError,
  } = useQuery<GetTrainingRuntimes>(GET_TRAINING_RUNTIMES);

  const [
    getTrainingRuntimeByName,
    { data: runtimeData, loading: runtimeLoading, error: runtimeError },
  ] = useLazyQuery<GetTrainingRuntimeByName>(GET_TRAINING_RUNTIME_BY_NAME);

  if (modelError) {
    Modal.error({
      title: modelError.name,
      content: modelError.message,
      onOk() {},
    });
    return null;
  }
  if (runtimeError) {
    Modal.error({
      title: runtimeError.name,
      content: runtimeError.message,
      onOk() {},
    });
    return null;
  }
  if (runtimesError) {
    Modal.error({
      title: runtimesError.name,
      content: runtimesError.message,
      onOk() {},
    });
    return null;
  }

  const profile = modelData?.model?.profiles?.filter(
    (x) => x.name === profileId,
  )[0];

  if (runtimesLoading || modelLoading) return <Spin spinning={true} />;

  function onSelectRuntime(value) {
    form.resetFields([['runtime', 'parameters']]);
    getTrainingRuntimeByName({ variables: { name: value } });
  }

  const trainingParameters =
    runtimeData?.trainingRuntimeEnvironmentByName?.parameters;
  return (
    <Form
      {...{
        labelCol: { sm: { span: 24 }, md: { span: 10 } },
      }}
      initialValues={{
        training_time: [moment(), undefined],
      }}
      form={form}
      name={props.formName}
      id={props.formName}
    >
      <Typography.Paragraph>
        <Alert
          type="info"
          message="Scheduling"
          description="A training is started automatically at a defined time in a selected runtime environment.
          Here you can select the earliest start- and latest end-time of the training.
          You also define the system on which the model is to be trained. Some runtime environments allow or require the
          specification of parameters, such as the selection of GPUs to be used for accelerated training. "
        />
      </Typography.Paragraph>
      <Divider orientation="left">Select start- and end-time</Divider>
      <FormHelp
        help={`A training has to be scheduled. You may select at least a start-time. If no end time is defined, a default max. training time of ${
          profile?.defaultTrainingMinutes / 60.0
        } hours will be applied.`}
      >
        <Form.Item
          name="training_time"
          label="Start at / (End at)"
          rules={[
            {
              type: 'array' as const,
              required: true,
              message: 'Select at least a start time.',
            },
          ]}
        >
          <RangePicker
            showTime
            style={{ width: '100%' }}
            placeholder={['Earliest start time', 'Latest end time']}
            format="YYYY-MM-DD HH:mm:ss"
            disabledDate={(currentDate: moment.Moment) =>
              currentDate.isBefore(moment())
            }
            allowEmpty={[false, true]}
          />
        </Form.Item>
      </FormHelp>
      <Divider orientation="left">Select runtime environment</Divider>
      <FormHelp help="You have to select a runtime where the training will be deployed to.">
        <Form.Item
          name={['runtime', 'name']}
          label="Runtime"
          rules={[{ required: true }]}
        >
          <Select onChange={onSelectRuntime} optionLabelProp="value">
            {runtimesData?.trainingRuntimeEnvironments.map((x) => (
              <Select.Option key={x.name} value={x.name} title={x.description}>
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
      <Spin spinning={runtimeLoading}>
        {!runtimeLoading && trainingParameters && (
          <>
            <Divider orientation="left">Runtime parameters</Divider>
            <Typography.Paragraph>
              You may define some runtime specific parameters for the training.
            </Typography.Paragraph>
            {trainingParameters.map((x) => (
              <ParameterFormItem
                key={x.name}
                namePrefix={['runtime', 'parameters']}
                parameter={x as ParameterDefinition}
                withHelp
              />
            ))}
          </>
        )}
      </Spin>
    </Form>
  );
};

export default ScheduleTraining;
