import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = '/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser(); // Get the current authenticated user
        if (user) {
          console.log(`The username: ${user.username}`);
          console.log(`The userId: ${user.userId}`);
          console.log(`The signInDetails: ${user.signInDetails}`);
          setIsAuthenticated(true); // User is authenticated
        } else {
          setIsAuthenticated(false); // User is not authenticated
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setIsAuthenticated(false); // Handle error, assume not authenticated
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Loading state while checking authentication
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />; // Redirect if not authenticated
};

export default ProtectedRoute;
