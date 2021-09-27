import { Col, Divider, PageHeader, Row } from 'antd';
import React, { FunctionComponent } from 'react';
import { DeleteProject } from './delete-project';
import { EditProject } from './edit-project';

interface OwnProps {}

type Props = OwnProps;

const Settings: FunctionComponent<Props> = (props) => {
  return (
    <Row justify="start">
      <Col span={18}>
        <EditProject />
        <Divider />
        <DeleteProject />
      </Col>
    </Row>
  );
};

export default Settings;
