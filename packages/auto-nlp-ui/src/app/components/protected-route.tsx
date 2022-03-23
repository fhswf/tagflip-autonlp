import React, { FunctionComponent } from 'react';
import { Navigate, Outlet, Route, RouteProps } from 'react-router-dom';

type OwnProps = RouteProps & {
  disabled: boolean;
};

const ProtectedRoute = ({ disabled, ...rest }) => {
  if (disabled) return <Navigate to="/project" />;
  return <Outlet />;
};

export default ProtectedRoute;
