import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'admin' | 'base';
  requiredId?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredType,
  requiredId 
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (requiredType && currentUser.type !== requiredType) {
    return <Navigate to="/" />;
  }

  if (requiredId !== undefined && currentUser.id !== requiredId) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;