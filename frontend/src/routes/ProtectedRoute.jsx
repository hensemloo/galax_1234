import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getHomePath } from './homePath';

// Wrap routes that need a logged-in user with a given role.
// Not logged in -> /login. Wrong role -> that user's own home page.
function ProtectedRoute({ role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
