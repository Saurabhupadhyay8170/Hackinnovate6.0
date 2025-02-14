import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlinePlus, AiOutlineFile, AiOutlineFolder } from "react-icons/ai";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiShareLine } from "react-icons/ri";

const Dashboard = () => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [recentDocs, setRecentDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharedLoading, setIsSharedLoading] = useState(true);
  const navigate = useNavigate();

  const templates = [
    { id: 1, name: "Resume", icon: "📄", description: "Professional resume templates" },
    { id: 2, name: "Project Proposal", icon: "📊", description: "Business proposal formats" },
    { id: 3, name: "Meeting Notes", icon: "📝", description: "Organized meeting templates" },
    { id: 4, name: "Business Letter", icon: "✉️", description: "Formal letter templates" },
  ];

  // Fetch user's documents (both recent and shared)
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
        setIsSharedLoading(false);
      }
    };

    fetchDocuments();
  }, [navigate]);

  const handleCreateDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        navigate('/login');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold text-sky-900">Welcome, {user?.name}!</h1>
        <p className="text-sky-700 mt-2">Create or access your documents</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <motion.button
          onClick={handleCreateDocument}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-sky-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <AiOutlinePlus className="text-xl" />
          Create New Document
        </motion.button>
      </motion.div>

      {/* Templates Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-sky-900">
          <MdOutlineDocumentScanner className="text-2xl text-sky-600" />
          Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredTemplate(template.id)}
              onHoverEnd={() => setHoveredTemplate(null)}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-sky-100"
            >
              <div className="text-3xl mb-3">{template.icon}</div>
              <h3 className="font-medium text-sky-900">{template.name}</h3>
              <AnimatePresence>
                {hoveredTemplate === template.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-sky-600 mt-2"
                  >
                    {template.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Documents */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-sky-900">
          <AiOutlineFolder className="text-2xl text-sky-600" />
          Recent Documents
        </h2>
        {isLoading ? (
          <div className="text-sky-600">Loading recent documents...</div>
        ) : recentDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDocs.map((doc) => (
              <motion.div
                key={doc._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-sky-100"
                onClick={() => navigate(`/document/d/${doc.documentId}`)}
              >
                <div className="flex items-start gap-3">
                  <AiOutlineFile className="text-2xl text-sky-500" />
                  <div>
                    <h3 className="font-medium text-sky-900">{doc.title || 'Untitled Document'}</h3>
                    <p className="text-sm text-sky-600">
                      opened {formatDate(doc.updatedAt || doc.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-sky-600">No recent documents</div>
        )}
      </motion.div>

      {/* Shared Documents */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-sky-900">
          <RiShareLine className="text-2xl text-sky-600" />
          Shared with me
        </h2>
        {isSharedLoading ? (
          <div className="text-sky-600">Loading shared documents...</div>
        ) : sharedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedDocs.map((doc) => (
              <motion.div
                key={doc._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-sky-100"
                onClick={() => navigate(`/document/d/${doc.documentId}`)}
              >
                <div className="flex items-start gap-3">
                  <AiOutlineFile className="text-2xl text-sky-500" />
                  <div>
                    <h3 className="font-medium text-sky-900">{doc.title || 'Untitled Document'}</h3>
                    <p className="text-sm text-sky-600">
                      {formatDate(doc.updatedAt || doc.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Shared by: {doc.author?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-sky-600">No shared documents</div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard; 