import { Navigate } from 'react-router-dom';

export const AuthMiddleware = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // Clear any existing data
    localStorage.clear();
    // Redirect to login
    return <Navigate to="/login" replace />;
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
    console.error('Auth Middleware Error:', error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}; 