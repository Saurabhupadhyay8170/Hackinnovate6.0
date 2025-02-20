import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlinePlus, AiOutlineFile, AiOutlineFolder, AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiShareLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import socket from '../utils/socket';

const Dashboard = () => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [recentDocs, setRecentDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharedLoading, setIsSharedLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch user's documents (both recent and shared)
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.clear(); // Clear any remaining data
          window.location.href = '/';
          return;
        }

        // Fetch both recent and shared documents
        const [recentResponse, sharedResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/documents/recent`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/documents/shared`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        ]);

        setRecentDocs(recentResponse.data.documents);
        setSharedDocs(sharedResponse.data.documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          window.location.href = '/';
        }
      } finally {
        setIsLoading(false);
        setIsSharedLoading(false);
      }
    };

    fetchDocuments();
  }, [navigate]);

  useEffect(() => {
    // Listen for share updates
    socket.on('share-update', async ({ documentId, sharedWith }) => {
      // If the current user is the one being shared with
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser.email === sharedWith) {
        try {
          const token = localStorage.getItem('token');
          // Use the correct endpoint for shared documents
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/documents/shared`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          setSharedDocs(response.data.documents);
        } catch (error) {
          console.error('Error fetching shared documents:', error);
        }
      }
    });

    return () => {
      socket.off('share-update');
    };
  }, []);

  const handleCreateDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        navigate('/');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/documents/create`,
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.documentId) {
        // Refresh recent documents after creating a new one
        const updatedDocsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/documents/recent`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setRecentDocs(updatedDocsResponse.data.documents);
        navigate(`/document/d/${response.data.documentId}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const formatDate = (dateString) => {
    // Convert to IST by adding 5 hours and 30 minutes
    const date = new Date(new Date(dateString).getTime() - (5.5 * 60 * 60 * 1000));
    const now = new Date(new Date().getTime());
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    }
    
    if (diffDays < 30) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/documents/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh documents after deletion
      const [recentResponse, sharedResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/documents/recent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/documents/shared`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setRecentDocs(recentResponse.data.documents);
      setSharedDocs(sharedResponse.data.documents);
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-[50%] aspect-square bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, -90, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-[50%] aspect-square bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 max-w-4xl"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-gray-400 mt-2">Create, collaborate, and manage your documents in one place</p>
        </motion.div>

        {/* Modified Quick Actions - removed Import Document button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <motion.button
            onClick={handleCreateDocument}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all shadow-lg text-lg font-medium"
          >
            <AiOutlinePlus className="text-2xl" />
            Create New Document
          </motion.button>
        </motion.div>

        {/* Enhanced Documents Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Recent Documents */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3 text-gray-200">
              <AiOutlineFolder className="text-3xl text-pink-500" />
              Recent Documents
            </h2>
            {isLoading ? (
              <div className="text-gray-400 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <AiOutlineLoading3Quarters className="text-2xl text-pink-500" />
                </motion.div>
                Loading recent documents...
              </div>
            ) : recentDocs.length > 0 ? (
              <div className="space-y-4">
                {recentDocs.map((doc) => (
                  <motion.div
                    key={doc._id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(236, 72, 153, 0.2)"
                    }}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-pink-500/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/document/d/${doc.documentId}`)}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-pink-500/10 rounded-lg">
                        <AiOutlineFile className="text-2xl text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-200 text-lg">{doc.title || 'Untitled Document'}</h3>
                        <p className="text-sm text-gray-400">
                          Last edited {formatDate(doc.updatedAt || doc.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentToDelete(doc);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 p-6 border border-dashed border-gray-700 rounded-xl text-center">
                No recent documents
              </div>
            )}
          </motion.div>

          {/* Shared Documents */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3 text-gray-200">
              <RiShareLine className="text-3xl text-pink-500" />
              Shared with me
            </h2>
            {isSharedLoading ? (
              <div className="text-gray-400 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <AiOutlineLoading3Quarters className="text-2xl text-pink-500" />
                </motion.div>
                Loading shared documents...
              </div>
            ) : sharedDocs.length > 0 ? (
              <div className="space-y-4">
                {sharedDocs.map((doc) => (
                  <motion.div
                    key={doc._id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(236, 72, 153, 0.2)"
                    }}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-pink-500/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/document/d/${doc.documentId}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-pink-500/10 rounded-lg">
                        <AiOutlineFile className="text-2xl text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-200 text-lg">{doc.title || 'Untitled Document'}</h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(doc.updatedAt || doc.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"/>
                          Shared by: {doc.author?.name || 'Unknown'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentToDelete(doc);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 p-6 border border-dashed border-gray-700 rounded-xl text-center">
                No shared documents
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[1001] p-6"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Delete Document</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{documentToDelete?.title || 'Untitled Document'}"? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDocument(documentToDelete?.documentId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 