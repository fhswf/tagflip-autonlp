import { useQuery } from '@apollo/client';
import { List, Modal, Spin } from 'antd';
import React from 'react';
import { createUseStyles } from 'react-jss';

import { useNavigate, useMatch } from 'react-router-dom';
import { GetProjects } from '../../apollo/__generated__/GetProjects';
import { GET_PROJECTS } from '../../apollo/projects';
import ProjectCard from './project-card';

const useStyles = createUseStyles({
  cardContainer: {
    background: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    boxShadow: 'inset 6px 7px 5px -5px rgba(107,107,107,0.17)',
  },
  cardItem: { height: '100%', margin: 10 },
});

const ProjectOverview = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery<GetProjects>(GET_PROJECTS);

  if (queryLoading) return <Spin spinning={true} />;

  if (queryError) {
    Modal.error({
      title: queryError.name,
      content: queryError.message,
      onOk() {
        console.log('ok');
      },
    });
    return null;
  }

  return (
    <div className="site-layout-content">
      <h1>Projects</h1>
      <List
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
        dataSource={queryData?.projects || []}
        renderItem={(item) => (
          <List.Item className={classes.cardItem}>
            <ProjectCard
              title={item.name}
              key={item.id}
              taskType={item.taskTypeName}
              onClick={() => navigate(`/project/${item.id}`)}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProjectOverview;
