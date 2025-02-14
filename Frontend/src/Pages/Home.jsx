import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

const Home = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#FF1F79]/10 to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Ingenium Docs
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, edit, and collaborate on documents in real-time
          </p>
          
          {/* Google Login Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => login()}
            className="flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all mx-auto"
          >
            <FcGoogle className="text-2xl" />
            <span className="font-medium">Continue with Google</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Collaboration",
              description: "Work together with your team in real-time"
            },
            {
              title: "Cloud Storage",
              description: "Access your documents from anywhere, anytime"
            },
            {
              title: "Smart Templates",
              description: "Get started quickly with pre-made templates"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
