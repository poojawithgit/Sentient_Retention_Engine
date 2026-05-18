import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sre_token');
  const is_admin_path = window.location.pathname.startsWith('/admin');
  
  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }
  
  return children;
};

export default ProtectedRoute;
