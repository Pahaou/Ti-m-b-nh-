import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AuthLoading() {
  return (
    <div className="page-loading">
      <div className="page-loading__spinner" />
      <p className="page-loading__text">Đang xác thực...</p>
    </div>
  );
}

export const ProtectedRoute = () => {
  const { isLoggedIn, loading } = useContext(AuthContext);
  const location = useLocation();
  const loggedIn = isLoggedIn();

  if (loading) return <AuthLoading />;

  if (!loggedIn) {
    const next = `${location.pathname}${location.search || ''}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAdmin, loading } = useContext(AuthContext);
  const admin = isAdmin();

  if (loading) return <AuthLoading />;

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
