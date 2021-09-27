import React, { FunctionComponent } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

type OwnProps = RouteProps & {
  disabled: boolean;
};

const ProtectedRoute: FunctionComponent<OwnProps> = ({ disabled, ...rest }) => {
  if (disabled) return <Redirect to="/" />;
  return <Route {...rest} />;
};

export default ProtectedRoute;
