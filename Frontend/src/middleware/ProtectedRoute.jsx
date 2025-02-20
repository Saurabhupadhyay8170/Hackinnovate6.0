import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // Clear any existing data and redirect to home
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  try {
    // Verify token format
    if (typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid token format');
    }

    // Verify user data
    const userData = JSON.parse(user);
    if (!userData._id || !userData.email) {
      throw new Error('Invalid user data');
    }

    return children;
  } catch (error) {
    console.error('Auth Error:', error);
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
};

export default ProtectedRoute; 