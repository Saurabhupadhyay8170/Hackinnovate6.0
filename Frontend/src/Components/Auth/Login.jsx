import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // Get user info from Google
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      );

      // Send to our backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google-login`,
        userInfo.data
      );

      // Save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log('Login Failed'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
        <button
          onClick={() => login()}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FcGoogle className="text-2xl" />
          <span>Continue with Google</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Login; 