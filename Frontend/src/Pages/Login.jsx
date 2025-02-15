import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import * as jwt_decode from 'jwt-decode';
import axios from 'axios';
import { motion } from 'framer-motion';

function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode.jwtDecode(credentialResponse.credential);

      const userData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        googleId: decoded.sub,
        token: credentialResponse.credential
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google-login`,
        userData
      );

      // Store token and user data including _id from backend response
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data.user._id,  // Store MongoDB ObjectId
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      }));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing Google login:', error);
      if (error.response) {
        console.error('Backend error:', error.response.data);
      }
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login failed:', error);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        <div className="relative group">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-25 group-hover:opacity-40 transition duration-500" />
          
          {/* Card Content */}
          <div className="relative rounded-lg overflow-hidden">
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            
            {/* Border Gradient */}
            <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            
            {/* Content Container */}
            <div className="relative bg-slate-900 p-8 rounded-lg">
              {/* Logo Design */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-24 h-24 mx-auto mb-8"
              >
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75" />
                
                {/* Inner Circle with Icon */}
                <div className="absolute inset-0.5 rounded-full bg-slate-900 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-8">
                Welcome Back
              </h1>

              {/* Description */}
              <p className="text-gray-300 text-center mb-8">
                Join our community of storytellers and bring your narratives to life
              </p>

              {/* Google Login Button Wrapper */}
              <div className="flex justify-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    locale="en"
                  />
                </motion.div>
              </div>

              {/* Additional Info */}
              <p className="text-sm text-gray-400 text-center">
                By signing in, you agree to our{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login; 