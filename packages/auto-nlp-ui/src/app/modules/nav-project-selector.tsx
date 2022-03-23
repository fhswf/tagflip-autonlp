import { DownOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Menu,
  Row,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { GetProjectBase } from '../apollo/__generated__/GetProjectBase';
import { GetProjects } from '../apollo/__generated__/GetProjects';
import { GET_PROJECT_BASE, GET_PROJECTS } from '../apollo/projects';

export const NavProjectSelector = () => {
  const navigate = useNavigate();
  const match = useMatch<string, string>('/project/:id/:page');
  const { data: dataProjectList, loading: dataProjectsLoading } =
    useQuery<GetProjects>(GET_PROJECTS);
  const { data: dataProject, loading: dataProjectLoading } =
    useQuery<GetProjectBase>(GET_PROJECT_BASE, {
      skip: !match?.params?.id,
      variables: { projectId: match?.params?.id },
    });

  if (dataProjectsLoading || dataProjectLoading)
    return <Spin spinning={true} />;

  const taskTypeTag = (project, color: string = undefined) => {
    return (
      <Tag color={color}>
        {project.taskTypeName
          .split(/\s+/)
          .map((x) => x[0])
          .join('')}
      </Tag>
    );
  };

  const menu = (
    <Menu selectedKeys={[dataProject?.project.id]}>
      {dataProjectList?.projects?.map((x) => (
        <Menu.Item
          key={x.id}
          onClick={async () => {
            navigate(`/project/${x.id}`);
          }}
        >
          {/*<Card hoverable>*/}
          {/*  <Card.Meta*/}
          {/*    title={*/}
          <Row justify="space-between">
            <Col>{taskTypeTag(x)}</Col>
            <Col>{x.name}</Col>
          </Row>
          {/*    }*/}
          {/*    description={*/}
          {/*      <>*/}
          {/*        <Divider orientation="left" />*/}
          {/*        <Typography.Paragraph ellipsis={{ tooltip: true, rows: 3 }}>*/}
          {/*          {dataProject?.project?.description || 'No description.'}*/}
          {/*        </Typography.Paragraph>*/}
          {/*      </>*/}
          {/*    }*/}
          {/*  />*/}
          {/*</Card>*/}
        </Menu.Item>
      ))}
    </Menu>
  );

  const projectName = () => {
    if (dataProject?.project)
      return (
        <>
          {taskTypeTag(dataProject.project, '#49aefd')}
          {dataProject.project.name}
        </>
      );
    return null;
  };

  return (
    <Dropdown overlay={menu} arrow>
      <Button type="primary">
        <Spin spinning={dataProjectsLoading || dataProjectLoading}>
          {projectName() || 'Select Project...'}
          <DownOutlined />
        </Spin>
      </Button>
    </Dropdown>
  );
};
