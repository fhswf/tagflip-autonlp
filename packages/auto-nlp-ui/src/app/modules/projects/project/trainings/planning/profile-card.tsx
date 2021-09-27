import { Card, Divider, Typography } from 'antd';
import { Profile } from 'auto-nlp-shared-js';
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
    height: 150,
  },
});

interface Props extends PropsWithChildren<any> {
  profile: Profile;
  onClick: () => any;
}

export const ProfileCard: FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Card
      className={classes.card}
      hoverable
      onClick={() => props.onClick() ?? {}}
    >
      <Card.Meta
        title={props.profile.name}
        description={
          <>
            <Divider orientation="left" />
            <Typography.Paragraph ellipsis={{ tooltip: true, rows: 3 }}>
              {props.profile.description}
            </Typography.Paragraph>
          </>
        }
      />
    </Card>
  );
};

export default ProfileCard;
