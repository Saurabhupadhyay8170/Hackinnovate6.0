import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiMailLine, RiCheckboxCircleLine } from 'react-icons/ri';

const ShareModal = ({ isOpen, onClose, onShare, documentTitle }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('reader');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    setError('');
    
    try {
      await onShare(email, accessLevel);
      setEmail('');
      setIsSuccess(true);
      // Auto close after 2 seconds of showing success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message || 'Error sharing document');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md relative"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <RiCheckboxCircleLine className="text-6xl text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Shared Successfully!
                </h3>
                <p className="text-gray-600">
                  Document has been shared with {email}
                </p>
              </motion.div>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal; 