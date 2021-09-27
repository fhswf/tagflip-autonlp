import { useQuery } from '@apollo/client';
import React from 'react';
import { GetProjectBase } from '../apollo/__generated__/GetProjectBase';
import { GET_PROJECT_BASE } from '../apollo/projects';

const ProjectNameBreadCrumb = ({ match }) => {
  const { data, loading, error } = useQuery<GetProjectBase>(GET_PROJECT_BASE, {
    skip: !match?.params?.id,
    variables: { projectId: match.params.id },
  });
  if (loading || error) return <span>...</span>;

  return <span>{data?.project?.name || '<unkown>'}</span>;
};

export default ProjectNameBreadCrumb;
