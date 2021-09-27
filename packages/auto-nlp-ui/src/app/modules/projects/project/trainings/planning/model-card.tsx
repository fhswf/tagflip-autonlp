import { Card, Col, Divider, Row, Tag, Typography } from 'antd';
import { Model } from 'auto-nlp-shared-js';
import React, { FC, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  card: {
    boxShadow: '1px 1px 13px 1px #fffff',
    border: '1px solid',
    borderColor: '#bfbfbf',
    borderRadius: 5,
    height: '100%',
  },
  desc: {
    minHeight: '100px',
  },
});

interface Props extends PropsWithChildren<any> {
  model: Model;
  onClick: () => any;
}

export const ModelCard: FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Card
      className={classes.card}
      hoverable
      onClick={() => props.onClick() ?? {}}
    >
      <Card.Meta
        title={
          <Row justify="space-between" wrap={false}>
            <Col>{props.model.name}</Col>
            <Col>
              {props.model.languages?.map((x) => (
                <Tag key={x} color="default">
                  {x}
                </Tag>
              ))}
            </Col>
          </Row>
        }
        description={
          <>
            <Divider orientation="left" />
            <Typography.Paragraph
              className={classes.desc}
              ellipsis={{ tooltip: true, rows: 3 }}
            >
              {props.model.meta?.description || 'No description.'}
            </Typography.Paragraph>
            {props.model.meta?.source ? (
              <cite>{props.model.meta?.source.url || 'No citation.'}</cite>
            ) : null}
          </>
        }
      />
    </Card>
  );
};

export default ModelCard;
