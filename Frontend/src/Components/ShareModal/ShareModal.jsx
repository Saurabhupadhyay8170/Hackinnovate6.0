import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiMailLine, RiCheckboxCircleLine } from 'react-icons/ri';
import api from '../../utils/api';

const ShareModal = ({ isOpen, onClose, onShare, documentTitle, documentId }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('reader');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [senderEmail, setSenderEmail] = useState('');
  const [sharedWithEmail, setSharedWithEmail] = useState('');

  useEffect(() => {
    const fetchDocumentUsers = async () => {
      if (!documentId) return;

      try {
        const response = await api.get(`/api/documents/${documentId}/users`);
        setDocumentUsers(response.data.users);
        const user = JSON.parse(localStorage.getItem('user'));
        setSenderEmail(user.email);
      } catch (error) {
        console.error('Error fetching document users:', error);
      }
    };

    if (isOpen) {
      fetchDocumentUsers();
    }
  }, [isOpen, documentId]);

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    setError('');
    
    try {
      await onShare(email, accessLevel);
      
      // Store the email before clearing it
      setSharedWithEmail(email);
      
      // Fetch updated users list
      const response = await api.get(`/api/documents/${documentId}/users`);
      setDocumentUsers(response.data.users);
      
      // Clear form
      setEmail('');
      setAccessLevel('reader');
      
      // Show success state
      setIsSuccess(true);
      
      // Close modal after delay
      setTimeout(() => {
        setIsSuccess(false);
        setSharedWithEmail(''); // Clear stored email
        onClose();
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'Error sharing document');
    } finally {
      setIsSharing(false);
    }
  };

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setError('');
      setEmail('');
      setAccessLevel('reader');
      setIsSharing(false);
    }
  }, [isOpen]);

  const UserAvatar = ({ user }) => (
    <div className="relative group">
      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-medium border border-sky-200">
        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
      </div>
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
        {user.email}
        <br />
        <span className="text-gray-300 text-xs">{user.role}</span>
      </div>
    </div>
  );

  // Success message component
  const SuccessMessage = ({ senderEmail, sharedEmail }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <RiCheckboxCircleLine className="text-6xl text-green-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Shared Successfully!
      </h3>
      <p className="text-gray-600 text-center">
        Document has been shared by you with {sharedEmail}
      </p>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md relative"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <SuccessMessage 
                  senderEmail={senderEmail} 
                  sharedEmail={sharedWithEmail}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-sky-900">Share Document</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                      <RiCloseLine className="text-2xl" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Share "{documentTitle}" with others
                  </p>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">People with access</h3>
                    <div className="flex flex-wrap gap-2">
                      {documentUsers.map((user, index) => (
                        <UserAvatar key={index} user={user} />
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleShare}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <span className="px-3 py-2 bg-gray-50">
                          <RiMailLine className="text-gray-500" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 px-3 py-2 outline-none"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Access Level</label>
                      <select
                        value={accessLevel}
                        onChange={(e) => setAccessLevel(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                      >
                        <option value="reader">Reader</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>

                    {error && (
                      <p className="text-red-500 mb-4">{error}</p>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSharing}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                      >
                        {isSharing ? 'Sharing...' : 'Share'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal; 