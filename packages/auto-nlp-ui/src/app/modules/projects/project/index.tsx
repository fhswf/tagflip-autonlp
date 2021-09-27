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
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
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
  let match = useRouteMatch<{ id: string }>('/project/:id/');
  let pageMatch = useRouteMatch<{ page: string }>('/project/:id/:page');

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
            <Link to={`${match.url}/data`}>Data</Link>
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
            <Link to={`${match.url}/training`}>Training</Link>
          </Menu.Item>
          <Menu.Item
            key="deployment"
            icon={<CloudSyncOutlined />}
            disabled={!projectData?.project.dataset}
          >
            <Link to={`${match.url}/deployment`}>Deployment</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            <Link to={`${match.url}/settings`}>Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content className="site-layout-content">
        <Switch>
          <Redirect
            path={`${match.url}/`}
            to={`${match.url}/data`}
            exact={true}
          />
          <Route path={`${match.url}/data`} component={DataSelection} />
          <ProtectedRoute
            disabled={!projectData?.project.dataset}
            path={`${match.url}/training`}
            exact={true}
            component={TrainingOverview}
          />
          <ProtectedRoute
            disabled={!projectData?.project.dataset}
            path={`${match.url}/training/new`}
            exact={true}
            component={NewTraining}
          />
          <ProtectedRoute
            disabled={!projectData?.project.dataset}
            path={`${match.url}/deployment`}
            exact={true}
            component={DeploymentOverview}
          />
          <Route
            path={`${match.url}/settings`}
            exact={true}
            component={Settings}
          />
        </Switch>
      </Content>
    </Layout>
  );
};

export default ProjectContainer;
