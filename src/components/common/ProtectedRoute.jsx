import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function ProtectedRoute({ children, role = 'ShopOwner' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role && user.role !== role) {
    return <Navigate to={user.role === 'Customer' ? '/customer/' : '/dashboard'} replace />;
  }
  return children;
}
