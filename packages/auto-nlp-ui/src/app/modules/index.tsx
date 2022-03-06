import { Breadcrumb, Col, Layout, Row } from 'antd';

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
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
            <Breadcrumb.Item key={match.params.id}>
              {breadcrumb}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Routes>
          <Route path="/project" element={<ProjectOverview />} />
          <Route path="/project/:id/*" element={<ProjectLayout />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ©2021 South Westphalia University of Applied Sciences
      </Footer>
    </Layout>
  );
};

export default App;
