import React, { FunctionComponent } from 'react';
import { Navigate, Outlet, Route, RouteProps } from 'react-router-dom';

type OwnProps = RouteProps & {
  children: React.ReactNode;
  disabled: boolean;
};

const ProtectedRoute = ({ children, disabled }: OwnProps) => {
  return disabled ? <Navigate to="/project" /> : children;
};

export default ProtectedRoute;
