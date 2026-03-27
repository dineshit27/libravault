import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({ requiredRole, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutal-white">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-5 border-brutal-black border-t-brutal-yellow animate-spin mb-4" />
          <p className="font-heading font-bold text-xl uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  return <ProtectedRoute requiredRole="admin" />;
}

export function UserRoute() {
  return <ProtectedRoute requiredRole="user" />;
}

export function AuthRoute() {
  return <ProtectedRoute />;
}
