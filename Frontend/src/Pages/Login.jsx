import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import * as jwt_decode from 'jwt-decode';

function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // Decode the JWT token from Google
      const decoded = jwt_decode.jwtDecode(credentialResponse.credential);
      
      // Store user data in localStorage
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing Google login:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Login</h1>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
}

export default Login; 