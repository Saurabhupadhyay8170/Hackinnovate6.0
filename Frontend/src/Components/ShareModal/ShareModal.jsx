import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiMailLine, RiCheckboxCircleLine, RiMoreLine, RiArrowDownSLine } from 'react-icons/ri';
import api from '../../utils/api';
import io from '../../utils/socket';

const ShareModal = ({ isOpen, onClose, onShare, documentTitle, documentId }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('reader');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [senderEmail, setSenderEmail] = useState('');
  const [sharedWithEmail, setSharedWithEmail] = useState('');
  const [removalFeedback, setRemovalFeedback] = useState({ show: false, email: '' });

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

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setError('');
      setEmail('');
      setAccessLevel('reader');
      setIsSharing(false);
      setSharedWithEmail('');
    }
  }, [isOpen]);

  // Auto close modal after success
  useEffect(() => {
    let timeoutId;
    if (isSuccess) {
      timeoutId = setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000); // Close after 2 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSuccess, onClose]);

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    setError('');
    
    try {
      await onShare(email, accessLevel);
      
      // Emit socket event for real-time update
      io.emit('document-shared', {
        documentId,
        sharedWith: email,
        accessLevel
      });
      
      // Store the email before clearing it
      setSharedWithEmail(email);
      
      // Fetch updated users list
      const response = await api.get(`/api/documents/${documentId}/users`);
      setDocumentUsers(response.data.users);
      
      // Show success state
      setIsSuccess(true);
      
      // Clear form
      setEmail('');
      setAccessLevel('reader');
      
    } catch (error) {
      setError(error.message || 'Error sharing document');
    } finally {
      setIsSharing(false);
    }
  };

  const UserAvatarRow = ({ users }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(null);
    const dropdownRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isAuthor = users.find(u => u.role === 'Author')?._id === currentUser._id;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowDropdown(false);
          setShowConfirmation(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRemoveAccess = async (user) => {
      try {
        await api.delete(`/api/documents/${documentId}/access/${user._id}`);
        
        setShowDropdown(false);
        setShowConfirmation(null);
        
        setRemovalFeedback({ 
          show: true, 
          email: user.email 
        });

        const response = await api.get(`/api/documents/${documentId}/users`);
        setDocumentUsers(response.data.users);

        io.emit('access-removed', {
          documentId,
          userId: user._id,
          userEmail: user.email
        });

        setTimeout(() => {
          setRemovalFeedback({ show: false, email: '' });
        }, 2000);

      } catch (error) {
        console.error('Error removing access:', error);
        setError('Failed to remove user access');
      }
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex -space-x-2">
            {users.slice(0, 4).map((user) => (
              <div
                key={user._id}
                className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-medium border-2 border-white ring-1 ring-sky-200"
                title={user.email}
              >
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
            ))}
          </div>
          {users.length > 4 && (
            <span className="text-sm text-gray-500">
              +{users.length - 4}
            </span>
          )}
          {isAuthor && (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <RiArrowDownSLine className="w-5 h-5" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-900 px-2 py-1">
                People with access
              </h3>
              <div className="mt-2 space-y-1">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-medium">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name || user.email}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                      </div>
                    </div>
                    {isAuthor && user.role !== 'Author' && (
                      <div>
                        {showConfirmation === user._id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowConfirmation(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRemoveAccess(user)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowConfirmation(user._id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                          >
                            <RiCloseLine className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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

  // Removal success message component
  const RemovalSuccessMessage = ({ email }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <RiCheckboxCircleLine className="text-6xl text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Access Removed
      </h3>
      <p className="text-gray-600 text-center">
        Access has been removed for {email}
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
              ) : removalFeedback.show ? (
                <RemovalSuccessMessage email={removalFeedback.email} />
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

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">People with access</h3>
                    <UserAvatarRow users={documentUsers} />
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