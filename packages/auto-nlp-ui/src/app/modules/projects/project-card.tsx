import { Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import { TaskType, TaskTypeLabel, TaskTypeShort } from 'auto-nlp-shared-js';

const useStyles = createUseStyles({
  card: {
    boxShadow: '1px 1px 13px 1px #fffff',
    border: '1px solid',
    borderColor: '#bfbfbf',
    borderRadius: 5,
    height: '100%',
  },
  desc: {
    height: 60,
  },
});

interface Props extends PropsWithChildren<any> {
  title: string;
  taskType: TaskType;
  description: string;
  onClick?: CallableFunction;
}

export const ProjectCard: FC<Props> = (props) => {
  const classes = useStyles();

  return (
    <Card
      className={classes.card}
      hoverable
      onClick={() => props.onClick() ?? {}}
    >
      <Card.Meta
        title={
          <Row justify="space-between">
            <Col>{props.title}</Col>
            <Col>
              <Tag className={TaskTypeShort.get(props.taskType)}>
                {TaskTypeLabel.get(props.taskType)}
              </Tag>
            </Col>
          </Row>
        }
        description={
          <>
            <Divider orientation="left" />
            <div className={classes.desc}>
              <Typography.Paragraph ellipsis={{ tooltip: true }}>
                {props.description || 'No description.'}
              </Typography.Paragraph>
            </div>
          </>
        }
      />
    </Card>
  );
};

export default ProjectCard;
