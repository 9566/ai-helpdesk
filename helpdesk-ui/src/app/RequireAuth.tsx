import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleHome } from '../hooks/useAuth';
import type { Role } from '../types';

interface RequireAuthProps {
  allowedRoles?: Role[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Outlet />;
}
