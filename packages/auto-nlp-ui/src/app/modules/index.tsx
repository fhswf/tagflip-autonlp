import { Breadcrumb, Col, Layout, Row } from 'antd';

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { NavAddMenu } from './nav-add-menu';
import { NavProjectSelector } from './nav-project-selector';
import ProjectNameBreadCrumb from './project-name-breadcrumb';
import ProjectOverview from './projects';
import ProjectLayout from './projects/project';

const useStyles = createUseStyles({
  content: { padding: '0 0px' },
  breadcrumb: {
    margin: '10px 10px',
  },
});

const App = () => {
  const breadcrumbs = useBreadcrumbs([
    {
      path: '/project/:id',
      breadcrumb: ProjectNameBreadCrumb,
    },
  ]);

  const classes = useStyles();

  const { Header, Content, Footer } = Layout;
  return (
    <Layout>
      <Header>
        <Row justify="space-between">
          <Col>
            <div className="logo">TagFlip AutoNLP</div>
            <NavProjectSelector />
          </Col>
          <Col>
            <NavAddMenu />
          </Col>
        </Row>
      </Header>
      <Content className={classes.content}>
        <Breadcrumb className={classes.breadcrumb}>
          {breadcrumbs.map(({ match, breadcrumb }) => (
            <Link key={match.url} to={match.url}>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Link>
          ))}
        </Breadcrumb>
        <Switch>
          <Redirect exact={true} from="/" to="/project" />
          <Route path="/project" exact={true} component={ProjectOverview} />
          <Route path="/project/:id" component={ProjectLayout} />
        </Switch>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ©2021 South Westphalia University of Applied Sciences
      </Footer>
    </Layout>
  );
};

export default App;
