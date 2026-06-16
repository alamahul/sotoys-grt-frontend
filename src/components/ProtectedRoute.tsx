import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  role?: 'customer' | 'admin';
}

export default function ProtectedRoute({ role = 'customer' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Wait for auth to finish loading before making redirect decisions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to="/admin-sotoys-grt/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika pelanggan mencoba mengakses rute admin
  if (role === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Jika admin mencoba mengakses halaman customer (opsional, jika ingin dipisah tegas)
  if (role === 'customer' && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

