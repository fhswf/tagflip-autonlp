import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';

import { Col, Row } from 'antd';
import React, { FunctionComponent } from 'react';
import { createUseStyles } from 'react-jss';

interface OwnProps {
  help: string;
}

type Props = OwnProps;

const { Paragraph } = Typography;

const useStyles = createUseStyles({
  itemWithHelp: {
    display: 'flex',
    alignItems: 'center',
  },
  item: {
    flex: 0.7,
  },
  help: {
    flex: 0.3,
    paddingLeft: 30,
    paddingRight: 30,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
  },
  icon: {
    padding: 10,
    fontSize: '150%',
  },
});

const FormHelp: FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.itemWithHelp}>
      <div className={classes.item}>{props.children}</div>
      <div className={classes.help}>
        <InfoCircleOutlined className={classes.icon} />
        <Paragraph type="secondary">{props.help}</Paragraph>
      </div>
    </div>
  );
};

export default FormHelp;
