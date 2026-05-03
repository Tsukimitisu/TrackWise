import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { RoleName } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: RoleName[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading TrackWise...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
