import {
  CloudSyncOutlined,
  FileTextOutlined,
  HighlightOutlined,
  LineChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { Layout, Menu } from 'antd';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Navigate, Route, Routes, useMatch } from 'react-router-dom';
import { GetProjectBase } from '../../../apollo/__generated__/GetProjectBase';
import { GET_PROJECT_BASE } from '../../../apollo/projects';
import ProtectedRoute from '../../../components/protected-route';
import DataSelection from './data/data-selection';
import DeploymentOverview from './deployments/overview/deployment-overview';
import Settings from './settings/settings';
import TrainingOverview from './trainings/overview/training-overview';
import NewTraining from './trainings/planning';

interface Props {}

const useStyles = createUseStyles({
  sider: {
    background: '#fff',
    padding: '0',
  },
});

const ProjectContainer: FC<Props> = (props) => {
  const { Content, Sider } = Layout;
  const classes = useStyles();
  const match = useMatch('/project/:id/*');
  const pageMatch = useMatch('/project/:id/:page');

  const { data: projectData } = useQuery<GetProjectBase>(GET_PROJECT_BASE, {
    variables: { projectId: match.params.id },
  });

  return (
    <Layout>
      <Sider
        className={classes.sider}
        width={200}
        collapsible
        breakpoint="lg"
        trigger={null}
      >
        <Menu
          mode="inline"
          selectedKeys={[pageMatch?.params?.page || 'data']}
          style={{ height: '100%' }}
        >
          <Menu.Item key="data" icon={<FileTextOutlined />}>
            <Link to={`/project/${match.params.id}/data`}>Data</Link>
          </Menu.Item>
          <Menu.Item
            key="annotation"
            disabled={true}
            icon={<HighlightOutlined />}
          >
            Labeling
          </Menu.Item>
          <Menu.Item
            key="training"
            icon={<LineChartOutlined />}
            disabled={!projectData?.project.dataset}
          >
            <Link to={`/project/${match.params.id}/training`}>Training</Link>
          </Menu.Item>
          <Menu.Item
            key="deployment"
            icon={<CloudSyncOutlined />}
            disabled={!projectData?.project.dataset}
          >
            <Link to={`/project/${match.params.id}/deployment`}>
              Deployment
            </Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            <Link to={`/project/${match.params.id}/settings`}>Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content className="site-layout-content">
        <Routes>
          <Route
            path={`data`}
            element={<DataSelection project={match.params.id} />}
          />
          <Route
            path={`training`}
            element={
              <ProtectedRoute disabled={!projectData?.project.dataset} />
            }
          >
            <Route path="" element={<TrainingOverview />} />
          </Route>
          <Route
            path={`training/new`}
            element={
              <ProtectedRoute disabled={!projectData?.project.dataset} />
            }
          >
            <Route path="" element={<NewTraining />} />
          </Route>
          <Route
            path={`deployment`}
            element={
              <ProtectedRoute disabled={!projectData?.project.dataset} />
            }
          >
            <Route path="" element={<DeploymentOverview />} />
          </Route>
          <Route path={`settings`} element={<Settings />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default ProjectContainer;
