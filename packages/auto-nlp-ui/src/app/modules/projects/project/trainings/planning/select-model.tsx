import { useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  List,
  Modal,
  notification,
  Row,
  Tag,
  Typography,
} from 'antd';
import { Model } from 'auto-nlp-shared-js';

import React, { FunctionComponent } from 'react';
import { createUseStyles } from 'react-jss';
import { useRouteMatch } from 'react-router-dom';
import { GetModelsForTaskType } from '../../../../../apollo/__generated__/GetModelsForTaskType';
import { GetProjectBase } from '../../../../../apollo/__generated__/GetProjectBase';
import { GET_MODELS_FOR_TASK_TYPE } from '../../../../../apollo/models';
import { GET_PROJECT_BASE } from '../../../../../apollo/projects';
import { selectedModel } from './index';
import ModelCard from './model-card';

const useStyles = createUseStyles({
  cardContainer: {
    background: '#f1f1f1',
    padding: 10,
    paddingRight: 30,
    borderRadius: 8,
    boxShadow: ' inset 6px 7px 5px -5px rgba(107,107,107,0.17)',
    height: '100%',
  },
  cardItem: { height: '100%', margin: 10 },
});

interface OwnProps {
  formName: string;
}

type Props = OwnProps;

const SelectModel: FunctionComponent<Props> = (props) => {
  const [form] = Form.useForm();
  const classes = useStyles();
  const match = useRouteMatch<{ id: string }>('/project/:id');

  const {
    data: projectData,
    loading: projectDataLoading,
    error: projectDataError,
  } = useQuery<GetProjectBase>(GET_PROJECT_BASE, {
    variables: { projectId: match.params.id },
  });

  const {
    data: modelData,
    loading: modelLoading,
    error: modelError,
  } = useQuery<GetModelsForTaskType>(GET_MODELS_FOR_TASK_TYPE, {
    skip: !projectData?.project?.taskType,
    variables: {
      taskType: projectData?.project?.taskType,
    },
  });

  if (projectDataError) {
    Modal.error({
      title: projectDataError.name,
      content: projectDataError.message,
      onOk() {},
    });
    return null;
  }

  if (modelError) {
    Modal.error({
      title: modelError.name,
      content: modelError.message,
      onOk() {},
    });
    return null;
  }

  const autoSelectModel = () => {
    const model = models[0];
    selectedModel(model);
    form.setFieldsValue({ model: model.id });
    form.submit();
    notification['info']({
      message: `Automatically selected model ${model.name}`,
    });
  };

  const models = (modelData?.modelsByTask as unknown) as Model[];

  return (
    <Form
      form={form}
      layout="vertical"
      id={props.formName}
      name={props.formName}
    >
      <Typography.Paragraph>
        <Alert
          type="info"
          message="Model selection"
          description="A model is a basic neural network architecture capable of representing the desired NLP task.
          A model is at most pre-trained and will be adapted to the desired NLP task by training.
          You have to select a model to be fine-tuned on your training data.
          If you have no clue which to choose, just run multiple trainings with different models to see
          which performs best for your task."
        />
      </Typography.Paragraph>
      <Form.Item
        name="model"
        label="Select a model"
        rules={[{ required: true, message: 'Please select a model.' }]}
      >
        <div className={classes.cardContainer}>
          <List
            loading={modelLoading || projectDataLoading}
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 2,
              xxl: 3,
            }}
            dataSource={models || []}
            renderItem={(item) => (
              <List.Item className={classes.cardItem}>
                <ModelCard
                  onClick={() => {
                    selectedModel(item);
                    form.setFieldsValue({ model: item.id });
                    form.submit();
                  }}
                  model={item as Model}
                />
              </List.Item>
            )}
          />
          {/*<Button*/}
          {/*  block*/}
          {/*  size="large"*/}
          {/*  style={{ margin: 10 }}*/}
          {/*  onClick={autoSelectModel}*/}
          {/*>*/}
          {/*  Choose automatically*/}
          {/*</Button>*/}
        </div>
      </Form.Item>
    </Form>
  );
};

export default SelectModel;
