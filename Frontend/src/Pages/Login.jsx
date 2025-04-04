import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import * as jwt_decode from 'jwt-decode';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Users, Pen, Share2, BookOpen, Edit3 } from 'lucide-react';
import CollaborativeEditor from '../components/CollaborativeEditor/CollaborativeEditor';

function Login() {
  const navigate = useNavigate();
  const [showCollaborativeEditor, setShowCollaborativeEditor] = useState(false);

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

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data.user._id,
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

  const toggleCollaborativeEditor = () => {
    setShowCollaborativeEditor(!showCollaborativeEditor);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.2 + Math.random() * 0.5,
              scale: 0.2 + Math.random() * 0.8,
            }}
            animate={{
              y: [null, '-100vh'],
              opacity: [null, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-screen-xl px-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        {/* Left Side - Welcome Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Welcome to Talespire
          </h1>
          <p className="text-lg md:text-xl text-purple-200/80 mb-8">
            Where imagination meets collaboration. Create, share, and bring your stories to life.
          </p>
          <div className="hidden md:flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-purple-200/60">Real-time collaboration</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-purple-200/60">Instant sharing</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Pen className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-purple-200/60">Creative writing</p>
            </div>
          </div>

          {/* Try Collaborative Editor Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCollaborativeEditor}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-full text-white hover:from-purple-600/30 hover:to-pink-600/30"
          >
            <Edit3 className="w-5 h-5 text-purple-400" />
            Try Collaborative Editor Without Login
          </motion.button>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/3"
        >
          <motion.div
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden bg-black/40 backdrop-blur-xl border-[1px] border-gradient-to-r from-purple-500 to-pink-500  rounded-xl"
            style={{
              borderImage: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153)) 1'
            }}
          >
            <div className="p-8">
              {/* Logo */}
              <div className="w-20 h-20 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75 blur-sm" />
                <div className="relative w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-white mb-6">
                Sign in to continue
              </h2>

              {/* Google Login */}
              <div className="flex justify-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    locale="en"
                    auto_select={false}
                  />
                </motion.div>
              </div>

              {/* Terms */}
              <p className="text-sm text-purple-200/60 text-center">
                By continuing, you agree to our{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Collaborative Editor Modal */}
      <CollaborativeEditor
        isOpen={showCollaborativeEditor}
        onClose={toggleCollaborativeEditor}
      />
    </div>
  );
}

export default Login; 