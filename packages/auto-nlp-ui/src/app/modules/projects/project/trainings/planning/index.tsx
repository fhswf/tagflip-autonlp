import { makeVar, useMutation } from '@apollo/client';
import {
  Button,
  Col,
  Form,
  Modal,
  notification,
  PageHeader,
  Row,
  Spin,
  Steps,
} from 'antd';
import { FormInstance } from 'antd/lib/form/hooks/useForm';
import { CreateTrainingInput } from 'auto-nlp-core/dist/modules/trainings/dto/create-training.input';
import { Model, Profile } from 'auto-nlp-shared-js';
import moment from 'moment';
import React, { FunctionComponent, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CREATE_TRAINING } from '../../../../../apollo/trainings';
import ParameterConfiguration from './parameter-configuration';
import ScheduleTraining from './schedule-training';
import SelectModel from './select-model';
import SelectProfile from './select-profile';

const { Step } = Steps;

const SELECT_MODEL_FORM = 'select_model';
const SELECT_PROFILE_FORM = 'select_profile_form';
const CONFIGURE_PARAMETERS_FORM = 'configure_parameters_form';
const SCHEDULE_TRAINING_FORM = 'schedule_training_form';

const useStyles = createUseStyles({
  stepContent: {
    minHeight: 300,
    padding: 30,
  },
  hidden: {
    display: 'none',
    visibility: 'hidden',
  },
});

const steps = () => [
  {
    title: 'Select model',
    formName: SELECT_MODEL_FORM,
    content: <SelectModel formName={SELECT_MODEL_FORM} />,
  },
  {
    title: 'Select profile',
    formName: SELECT_PROFILE_FORM,
    content: <SelectProfile formName={SELECT_PROFILE_FORM} />,
  },
  {
    title: 'Configure',
    formName: CONFIGURE_PARAMETERS_FORM,
    content: <ParameterConfiguration formName={CONFIGURE_PARAMETERS_FORM} />,
  },
  {
    title: 'Schedule',
    formName: SCHEDULE_TRAINING_FORM,
    content: <ScheduleTraining formName={SCHEDULE_TRAINING_FORM} />,
  },
];

interface OwnProps {}

type Props = OwnProps;

const FORM_INITIAL_STATE = {
  project: null,
  earliestStartTime: null,
  latestEndTime: null,
  profileDescription: null,
  model: null,
  runtimeDescription: null,
};

export const selectedModel = makeVar<Model>(null);
export const selectedProfile = makeVar<Profile>(null);
export const formData = makeVar(FORM_INITIAL_STATE);

const NewTraining: FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  let match = useRouteMatch<{ id: string }>('/project/:id/');
  const [current, setCurrent] = React.useState(0);

  const [
    createTraining,
    { loading: createTrainingLoading },
  ] = useMutation<CreateTrainingInput>(CREATE_TRAINING, {});

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const selectModel = (model) => {
    formData({
      ...formData(),
      model: model,
    });
    next();
  };

  const selectProfile = (profile) => {
    formData({
      ...formData(),
      profileDescription: {
        profile: profile,
        trainingParameters: null,
        hyperParameters: null,
      },
    });
    next();
  };

  const onFormFinish = (
    name: string,
    info: { values; forms: Record<string, FormInstance> },
  ) => {
    if (name === SELECT_MODEL_FORM) {
      if (
        formData().model &&
        formData().model !== info.values.model &&
        formData().profileDescription
      ) {
        Modal.confirm({
          title: 'Changing model will overwrite you configuration',
          content:
            'You are about to change the model. Setting the model to another model will reset your configuration. Are you sure?',
          onOk: () => selectModel(info.values.model),
        });
      } else {
        selectModel(info.values.model);
      }
    }
    if (name === SELECT_PROFILE_FORM) {
      if (
        formData().profileDescription &&
        formData().profileDescription.profile !== info.values.profile
      ) {
        Modal.confirm({
          title: 'Changing profile will overwrite parameters',
          content:
            'You are about to change the profile. Setting the profile to another profile will reset the configuration. Are you sure?',
          onOk: () => selectProfile(info.values.profile),
        });
      } else {
        selectProfile(info.values.profile);
      }
    }
    if (name === CONFIGURE_PARAMETERS_FORM) {
      formData({
        ...formData(),
        profileDescription: {
          ...formData().profileDescription,
          trainingParameters: info.values.trainingParameters,
          hyperParameters: info.values.hyperParameters,
        },
      });
      next();
    }
    if (name === SCHEDULE_TRAINING_FORM) {
      formData({
        ...formData(),
        earliestStartTime: info.values.training_time[0],
        latestEndTime:
          info.values.training_time[1] ||
          moment(info.values.training_time[0]).add(
            selectedProfile().defaultTrainingMinutes,
            'minute',
          ),
        runtimeDescription: {
          runtime: info.values.runtime.name,
          parameters: info.values.runtime.parameters,
        },
        project: match.params.id,
      });
      createTraining({
        variables: {
          data: formData(),
        },
      })
        .then(() => {
          formData(FORM_INITIAL_STATE);
          notification['success']({
            message: 'Training scheduled',
          });
          history.goBack();
        })
        .catch((err) => {
          Modal.error({
            title: 'Could not save training',
            content: err.message,
          });
        });
    }
  };

  useEffect(() => {
    return () => {
      formData(FORM_INITIAL_STATE);
    };
  }, []);

  const planningSteps = steps();

  if (createTrainingLoading) return <Spin spinning={true} />;

  return (
    <Form.Provider onFormFinish={onFormFinish}>
      <PageHeader
        title="Training Planner"
        subTitle="Schedule a new training"
        onBack={() => history.goBack()}
      />
      <Steps size="small" current={current} responsive={true}>
        {planningSteps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div className={`${classes.stepContent}`}>
        {planningSteps[current].content}
      </div>

      <Row justify="end">
        <Col>
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              Previous
            </Button>
          )}
          {current > 1 && current < planningSteps.length - 1 && (
            <Button
              htmlType="submit"
              form={planningSteps[current].formName}
              type="primary"
            >
              Next
            </Button>
          )}
          {current === planningSteps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              form={planningSteps[current].formName}
            >
              Finish
            </Button>
          )}
        </Col>
      </Row>
    </Form.Provider>
  );
};

export default NewTraining;
