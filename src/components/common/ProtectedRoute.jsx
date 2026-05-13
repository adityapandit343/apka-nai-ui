import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}