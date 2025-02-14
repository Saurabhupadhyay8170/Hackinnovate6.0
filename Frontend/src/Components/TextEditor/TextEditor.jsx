import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from 'lodash/function';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiBold, RiItalic, RiUnderline, RiAlignLeft, RiAlignCenter,
  RiAlignRight, RiAlignJustify, RiFormatClear, RiListOrdered,
  RiListUnordered, RiArrowGoBackLine, RiArrowGoForwardLine,
  RiShareLine, RiMessage2Line
} from 'react-icons/ri';
import api from '../../utils/api';
import ShareModal from '../ShareModal/ShareModal';
import Feedback from '../Feedback/Feedback';
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function TextEditor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const [saveStatus, setSaveStatus] = useState({ status: 'saved', message: 'All changes saved' });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCursor, setUserCursor] = useState({ x: 0, y: 0 });
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080']; // Cursor colors

  // Move editor initialization before the useEffect
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
    ],
    content: documentContent,
    autofocus: true,
    editable: userRole === 'author',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      handleContentChange(content);
      // Emit changes to other users
      socket.emit("send-changes", content);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        socket.emit('selection-change', {
          documentId,
          selection: { from, to },
          user: JSON.parse(localStorage.getItem('user'))
        });
      }
    },
  });

  // Socket.IO effect
  useEffect(() => {
    if (!documentId || !editor) return;

    // Join the document room
    socket.emit('join-document', documentId);

    // Load document from server
    socket.on("load-document", (document) => {
      setDocumentContent(document);
      editor.commands.setContent(document);
    });

    // Listen for incoming changes
    socket.on("receive-changes", (newContent) => {
      // Only update if the content is different to prevent loops
      if (newContent !== editor.getHTML()) {
        editor.commands.setContent(newContent);
      }
    });

    socket.on('selection-update', ({ user, selection }) => {
      setActiveUsers(prevUsers => {
        const newUsers = [...prevUsers];
        const userIndex = newUsers.findIndex(u => u.userId === user._id);
        
        if (userIndex !== -1) {
          newUsers[userIndex].selection = selection;
        }
        
        return newUsers;
      });
    });

    return () => {
      socket.off("receive-changes");
      socket.off("load-document");
      socket.emit('leave-document', documentId);
      socket.off('selection-update');
    };
  }, [documentId, editor]);

  const handleContentChange = useCallback((content) => {
    setSaving(true);
    saveDocument(content);
  }, []);

  const saveDocument = async (content) => {
    try {
      await api.put(`/api/documents/${documentId}`, {
        title,
        content,
      });
      setSaveStatus({ status: 'saved', message: 'All changes saved' });
      setSaving(false);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus({ status: 'error', message: 'Error saving' });
    }
  };

  const handleTitleChange = async (newTitle) => {
    setTitle(newTitle);
    setSaving(true);
    try {
      await api.put(`/api/documents/${documentId}`, {
        title: newTitle,
        content: editor?.getHTML() || ''
      });
      setSaveStatus({ status: 'saved', message: 'All changes saved' });
    } catch (error) {
      console.error('Error saving title:', error);
      setSaveStatus({ status: 'error', message: 'Error saving' });
    } finally {
      setSaving(false);
    }
  };

  // Add heading handler
  const toggleHeading = (level) => {
    if (!editor) return;
    
    if (level === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
    }
  };

  const MenuButton = ({ onClick, icon: Icon, isActive = null, tooltip }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2 rounded hover:bg-gray-100 ${
        isActive ? 'bg-gray-200' : ''
      }`}
      title={tooltip}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : ''}`} />
    </button>
  );

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/api/documents/${documentId}`);
        const document = response.data;
        // console.log(document);
        
        if (document) {
            setTitle(document.title || 'Untitled Document');
            editor?.commands.setContent(document.content || '');
            
            // Get user ID from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            // console.log(user._id);
          
          // Determine user's role
          if (document.author === user._id) {
            setUserRole('author');
          } else if (document.editorAccess.includes(user._id)) {
            setUserRole('editor');
          } else if (document.reviewerAccess.includes(user._id)) {
            setUserRole('reviewer');
          } else {
            setUserRole('reader');
          }

          console.log(userRole);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        if (error.response?.status === 404) {
          navigate('/dashboard');
        }
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId, editor, navigate]);

  const handleShare = async (email, accessLevel) => {
    try {
      await api.post(`/api/documents/${documentId}/share`, {
        email,
        accessLevel
      });
      setSaveStatus({ status: 'saved', message: 'Document shared successfully' });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error sharing document');
    }
  };

  useEffect(() => {
    const handleMouseMove = throttle((e) => {
      const editorContent = document.querySelector('.ProseMirror');
      if (!editorContent) return;
      
      const rect = editorContent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only emit if position has changed significantly
      if (Math.abs(x - userCursor.x) > 5 || Math.abs(y - userCursor.y) > 5) {
        setUserCursor({ x, y });
        socket.emit('cursor-move', {
          documentId,
          position: { x, y },
          user: JSON.parse(localStorage.getItem('user'))
        });
      }
    }, 50); // Throttle to 50ms for smooth performance

    const editorContent = document.querySelector('.ProseMirror');
    if (editorContent) {
      editorContent.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (editorContent) {
        editorContent.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [documentId, userCursor]);

  useEffect(() => {
    // Handle new user joining
    socket.on('user-joined', (users) => {
      setActiveUsers(users);
    });

    // Handle user cursor updates
    socket.on('cursor-update', (userData) => {
      setActiveUsers(prevUsers => {
        const newUsers = [...prevUsers];
        const userIndex = newUsers.findIndex(u => u.userId === userData.user._id);
        
        if (userIndex !== -1) {
          newUsers[userIndex].position = userData.position;
        } else {
          newUsers.push({
            userId: userData.user._id,
            name: userData.user.name,
            position: userData.position,
            color: colors[newUsers.length % colors.length]
          });
        }
        
        return newUsers;
      });
    });

    // Handle user leaving
    socket.on('user-left', (userId) => {
      setActiveUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
    });

    return () => {
      socket.off('user-joined');
      socket.off('cursor-update');
      socket.off('user-left');
    };
  }, []);

  const UserCursor = ({ user }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          left: user.position.x,
          top: user.position.y,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
        {/* Main cursor */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={user.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* User label */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            position: 'absolute',
            left: 16,
            top: 8,
            background: user.color,
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transform: 'translateY(-50%)',
          }}
        >
          {user.name}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const SelectionIndicator = ({ user }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        left: 0,
        background: `${user.color}33`, // Add transparency to the color
        padding: '0 1px',
        borderLeft: `2px solid ${user.color}`,
        height: '1.2em',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-1.4em',
          left: '0',
          background: user.color,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {user.name}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[90%] mx-auto p-4"
      >
        <div className="relative group mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => userRole === 'author' ? setTitle(e.target.value) : null}
            onBlur={(e) => userRole === 'author' ? handleTitleChange(e.target.value) : null}
            className={`w-full text-3xl font-bold p-2 border-none outline-none bg-transparent 
              ${userRole === 'author' ? 'group-hover:bg-gray-50' : ''} rounded transition-colors`}
            placeholder="Untitled Document"
            readOnly={userRole !== 'author'}
          />
        </div>

        <div className="sticky top-0 z-40 bg-white border-b mb-4 p-2 flex flex-wrap gap-2">
          {userRole === 'author' && (
            <>
              <div className="flex items-center gap-1 border-r pr-2">
                <MenuButton
                  onClick={() => editor.chain().focus().undo().run()}
                  icon={RiArrowGoBackLine}
                  tooltip="Undo"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().redo().run()}
                  icon={RiArrowGoForwardLine}
                  tooltip="Redo"
                />
              </div>

              <div className="flex items-center gap-1 border-r pr-2">
                <select
                  onChange={(e) => toggleHeading(e.target.value)}
                  value={
                    editor?.isActive('heading', { level: 1 })
                      ? '1'
                      : editor?.isActive('heading', { level: 2 })
                      ? '2'
                      : editor?.isActive('heading', { level: 3 })
                      ? '3'
                      : 'paragraph'
                  }
                  className="p-1 border rounded bg-white"
                >
                  <option value="paragraph">Normal</option>
                  <option value="1">Heading 1</option>
                  <option value="2">Heading 2</option>
                  <option value="3">Heading 3</option>
                </select>
              </div>

              <div className="flex items-center gap-1 border-r pr-2">
                <MenuButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  icon={RiBold}
                  tooltip="Bold"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  icon={RiItalic}
                  tooltip="Italic"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive('underline')}
                  icon={RiUnderline}
                  tooltip="Underline"
                />
              </div>

              <div className="flex items-center gap-1 border-r pr-2">
                <MenuButton
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  isActive={editor.isActive({ textAlign: 'left' })}
                  icon={RiAlignLeft}
                  tooltip="Align Left"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  isActive={editor.isActive({ textAlign: 'center' })}
                  icon={RiAlignCenter}
                  tooltip="Align Center"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  isActive={editor.isActive({ textAlign: 'right' })}
                  icon={RiAlignRight}
                  tooltip="Align Right"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  isActive={editor.isActive({ textAlign: 'justify' })}
                  icon={RiAlignJustify}
                  tooltip="Justify"
                />
              </div>

              <div className="flex items-center gap-1 border-r pr-2">
                <MenuButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  icon={RiListUnordered}
                  tooltip="Bullet List"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  icon={RiListOrdered}
                  tooltip="Numbered List"
                />
              </div>

              <MenuButton
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                icon={RiFormatClear}
                tooltip="Clear Formatting"
              />

              {userRole === 'author' && (
                <div className="bg-red-500 flex items-center gap-1 border-l rounded-lg hover:bg-red-400">
                  <MenuButton
                    onClick={() => setIsShareModalOpen(true)}
                    icon={RiShareLine}
                    tooltip="Share Document"
                  />
                </div>
              )}

              {userRole === 'author' && (
                <div className="flex items-center gap-1 border-l pl-2">
                  <MenuButton
                    onClick={() => setIsFeedbackModalOpen(true)}
                    icon={RiMessage2Line}
                    tooltip="View Reader Feedback"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div 
          className="border rounded-lg overflow-hidden bg-white relative"
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent 
            editor={editor} 
            className="prose max-w-none min-h-[calc(100vh-200px)] p-4"
          />
          {activeUsers.map(user => (
            <React.Fragment key={user.userId}>
              <UserCursor user={user} />
              {user.selection && <SelectionIndicator user={user} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence>
          {isFeedbackModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Reader Feedback</h2>
                    <button
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <Feedback
                    documentId={documentId}
                    userId={JSON.parse(localStorage.getItem('user'))?._id}
                    userRole={userRole}
                    isModal={true}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {userRole === 'reader' && (
          <div className="mt-8">
            <Feedback 
              documentId={documentId}
              userId={JSON.parse(localStorage.getItem('user'))?._id}
              userRole={userRole}
              isModal={false}
            />
          </div>
        )}

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShare}
          documentTitle={title}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 p-3 rounded-lg shadow-lg flex items-center gap-2"
          style={{
            backgroundColor: '#10B981',
            opacity: saveStatus.status === 'saving' ? 0.8 : 1,
          }}
        >
          <span className={`w-2 h-2 rounded-full ${
            saveStatus.status === 'saving' ? 'animate-pulse bg-white' : 'bg-white'
          }`} />
          <span className="text-white font-medium">
            {saveStatus.message}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default TextEditor; 