import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext'; // Adjust the path to your AuthContext

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();
console.log("isAuthenticated: ", isAuthenticated)
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
