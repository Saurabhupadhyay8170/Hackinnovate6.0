import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-800 rounded-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Access Denied
        </h2>

        <p className="text-gray-400 mb-8">
          You don't have permission to access this document. Please contact the document owner for access.
        </p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go to Home
        </button>
      </motion.div>
    </div>
  );
};

export default AccessDenied; 