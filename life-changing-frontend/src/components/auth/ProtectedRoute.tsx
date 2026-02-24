import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserType } from '@/lib/types';

interface ProtectedRouteProps {
  allowedRoles?: UserType[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.userType)) {
    // Redirect to their appropriate dashboard if they try to access a wrong one
    if (user.userType === UserType.ADMIN) return <Navigate to="/admin" replace />;
    if (user.userType === UserType.DONOR) return <Navigate to="/donor" replace />;
    if (user.userType === UserType.BENEFICIARY) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
