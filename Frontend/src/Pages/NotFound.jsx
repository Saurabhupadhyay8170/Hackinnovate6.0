import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RiHome4Line, RiArrowLeftLine, RiSpaceShipLine } from 'react-icons/ri';

const NotFound = () => {
  const navigate = useNavigate();

  // Animation variants for stars
  const starVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: Math.random() * 2 + 1,
        repeat: Infinity,
      },
    },
  };

  // Generate random stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 1}px`,
  }));

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated stars background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          variants={starVariants}
          animate="animate"
          className="absolute bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-9xl font-bold text-white mb-8"
        >
          404
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <RiSpaceShipLine className="w-24 h-24 text-sky-400 mx-auto rotate-45" />
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Lost in Space
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-gray-400 text-lg mb-8"
        >
          The page you're looking for has drifted into a black hole
        </motion.p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-transparent border border-sky-400 text-sky-400 rounded-lg flex items-center gap-2 hover:bg-sky-400 hover:text-white transition-all duration-300"
          >
            <RiArrowLeftLine className="text-xl" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-sky-400 text-white rounded-lg flex items-center gap-2 hover:bg-sky-500 transition-all duration-300"
          >
            <RiHome4Line className="text-xl" />
            Home
          </button>
        </motion.div>
      </div>

      {/* Animated meteor */}
      <motion.div
        initial={{ x: '100vw', y: -100 }}
        animate={{ x: '-100vw', y: '100vh' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        className="absolute w-1 h-1 bg-white"
        style={{
          background: 'linear-gradient(to right, transparent, white)',
          width: '100px',
          height: '2px',
        }}
      />
    </div>
  );
};

export default NotFound; 