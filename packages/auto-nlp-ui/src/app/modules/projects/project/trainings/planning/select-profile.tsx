import { useQuery } from '@apollo/client';
import { Alert, Form, List, Modal, Spin, Typography } from 'antd';
import { Profile } from 'auto-nlp-shared-js';

import React, { FunctionComponent } from 'react';
import { createUseStyles } from 'react-jss';
import { useMatch } from 'react-router-dom';
import { GetModel } from '../../../../../apollo/__generated__/GetModel';
import { GetProjectBase } from '../../../../../apollo/__generated__/GetProjectBase';
import { GET_MODEL } from '../../../../../apollo/models';
import { GET_PROJECT_BASE } from '../../../../../apollo/projects';
import { formData, selectedProfile } from './index';
import ProfileCard from './profile-card';

const useStyles = createUseStyles({
  cardContainer: {
    background: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    boxShadow: ' inset 6px 7px 5px -5px rgba(107,107,107,0.17)',
  },
  cardItem: { height: '100%', margin: 10 },
});

interface OwnProps {
  formName: string;
}

type Props = OwnProps;

const SelectProfile: FunctionComponent<Props> = (props) => {
  const [form] = Form.useForm();
  const modelId = formData().model;
  const match = useMatch('/project/:id');
  const classes = useStyles();

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
  } = useQuery<GetModel>(GET_MODEL, {
    skip: !modelId,
    variables: {
      modelId: modelId,
    },
  });

  if (modelError) {
    Modal.error({
      title: modelError.name,
      content: modelError.message,
      onOk() {},
    });
    return null;
  }

  if (modelLoading) return <Spin spinning={true} />;

  return (
    <Form
      form={form}
      layout="vertical"
      name={props.formName}
      id={props.formName}
    >
      <Typography.Paragraph>
        <Alert
          type="info"
          message="Profile selection"
          description="A profile describes pre-configuration to train the selected model. In the background, a profile
          specifies a training program that is executed automatically. In addition, a profile specifies a set of
          possible parameters that you can freely configure subsequently. Some profiles are more freely configurable
          than others. In general it is a good idea to schedule multiple trainings with different models and training profile configurations to see which performs best."
        />
      </Typography.Paragraph>
      <Form.Item
        name="profile"
        label="Select a training profile"
        rules={[
          { required: true, message: 'Please select a trainings profile.' },
        ]}
      >
        <List
          loading={modelLoading}
          className={classes.cardContainer}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 2,
            xxl: 3,
          }}
          dataSource={
            modelData?.model?.profiles.filter(
              (x) => x.taskType === projectData?.project?.taskType,
            ) || []
          }
          renderItem={(item) => (
            <List.Item className={classes.cardItem}>
              <ProfileCard
                onClick={() => {
                  form.setFieldsValue({ profile: item.name });
                  selectedProfile(item as unknown as Profile);
                  form.submit();
                }}
                profile={item as unknown as Profile}
              />
            </List.Item>
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default SelectProfile;
