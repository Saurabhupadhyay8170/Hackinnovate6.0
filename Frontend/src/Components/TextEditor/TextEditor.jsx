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
  RiShareLine, RiArrowLeftLine, RiEdit2Line, RiArrowLeftSLine,
  RiCheckLine
} from 'react-icons/ri';
import api from '../../utils/api';
import ShareModal from '../ShareModal/ShareModal';
import Feedback from '../Feedback/Feedback';
import { io } from "socket.io-client";
import axios from 'axios';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAKkCKtLyIfZt8KTfaOLPG0ylKVmrNy5T8";

const AISuggestion = ({ suggestion, position, onAccept, onDismiss }) => {
  if (!suggestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50"
      style={{
        left: position.x,
        top: position.y + 24,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">AI Suggestion</span>
        </div>
        <p className="text-gray-700 mb-2">{suggestion}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Dismiss
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Accept ⌘↵
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [localUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      _id: user._id,
      name: user.name,
    };
  });

  //Auto Complete Cursor

  const getCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
  
    return { x: rect.left, y: rect.top + 25 }; // Position suggestion below cursor
  };

  const fetchCompletion = async (text) => {
    if (!text.trim()) return "";
  
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=YOUR_GEMINI_API_KEY`,
        {
          prompt: { text: `Complete this sentence: "${text}"` },
          maxTokens: 50
        }
      );
  
      return response.data.candidates[0].output || "";
    } catch (error) {
      console.error("Error fetching AI completion:", error);
      return "";
    }
  };
  const [content, setContent] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [lastText, setLastText] = useState("");
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');

  const AihandleInput = async (e) => {
    const text = e.target.innerText;
    setContent(text);

    const aiSuggestion = await fetchCompletion(text);
    setAiSuggestion(aiSuggestion);
  };

  const AihandleKeyUp = () => {
    const pos = getCursorPosition();
    if (pos) setCursorPosition(pos);
  };

  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((event) => {
    // Toggle AI with Cmd+/ or Ctrl+/
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      setIsAIEnabled(prev => !prev);
      
      // If turning off AI, clear suggestions
      if (isAIEnabled) {
        setShowSuggestion(false);
        setAiSuggestion('');
        setContext('');
      } else {
        // If turning on AI, trigger suggestion
        triggerAISuggestion();
      }
    }
    
    // Accept suggestion with Cmd/Ctrl + Enter
    if (showSuggestion && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      acceptSuggestion();
    }

    // Dismiss with Escape
    if (event.key === 'Escape' && showSuggestion) {
      event.preventDefault();
      setShowSuggestion(false);
    }
  }, [isAIEnabled, showSuggestion]);

  // Add keyboard shortcut listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

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
    editable: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      handleContentChange(content);
      // Emit changes to other users
      socket.emit("send-changes", content);
      
      // Only trigger AI if enabled
      if (isAIEnabled) {
        const { view } = editor;
        const pos = view.coordsAtPos(view.state.selection.anchor);
        setCursorPosition({ x: pos.left, y: pos.top });
        
        // Get text for AI completion
        const text = editor.getText();
        handleAICompletion(text);
      }
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
    onKeyDown: ({ event }) => {
      // Trigger AI suggestion with Cmd+/
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        triggerAISuggestion();
      }
      // Accept suggestion with Cmd+Enter
      if (showSuggestion && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        acceptSuggestion();
      }
      // Dismiss with Escape
      if (event.key === 'Escape') {
        setShowSuggestion(false);
      }
    }
  });

  // Socket.IO effect
  useEffect(() => {
    if (!documentId || !editor) return;

    // Join document with user info
    socket.emit('join-document', {
      documentId,
      user: localUser
    });

    // Handle initial document load
    socket.on('load-document', (data) => {
      editor.commands.setContent(data.content);
      setActiveUsers(new Map(data.users.map(user => [user.id, user])));
    });

    // Handle real-time content updates
    socket.on('receive-changes', (update) => {
      if (update.userId !== localUser._id) {
        editor.commands.setContent(update.content);
      }
    });

    // Handle cursor updates
    socket.on('cursor-update', ({ userId, position, color, name, selection }) => {
      setActiveUsers(prev => {
        const next = new Map(prev);
        const user = next.get(userId) || { id: userId, name };
        next.set(userId, { 
          ...user, 
          position,
          color,
          selection,
          lastActive: Date.now()
        });
        return next;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off('load-document');
      socket.off('receive-changes');
      socket.off('cursor-update');
      socket.emit('leave-document', { documentId, userId: localUser._id });
    };
  }, [documentId, editor, localUser]);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    // Save to server
    socket.emit('send-changes', {
      documentId,
      content: newContent
    });
  }, [documentId]);

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
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        navigate('/login', { 
          replace: true,
          state: { from: `/document/d/${documentId}` }
        });
        return false;
      }

      try {
        JSON.parse(user); // Verify user data is valid JSON
        return true;
      } catch (error) {
        console.error('Invalid user data:', error);
        navigate('/login');
        return false;
      }
    };

    if (!checkAuth()) return;

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
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          navigate('/dashboard');
        }
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId, editor, navigate]);

  useEffect(() => {
    if (editor && userRole) {
      editor.setEditable(userRole === 'author' || userRole === 'editor');
    }
  }, [editor, userRole]);

  const handleShare = async (email, accessLevel) => {
    try {
      await api.post(`/api/documents/${documentId}/share`, {
        email,
        accessLevel
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error sharing document');
    }
  };

  useEffect(() => {
    if (!documentId || !editor) return;

    let updateTimeout;
    
    const handleUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        const content = editor.getHTML();
        socket.emit('send-changes', {
          documentId,
          content
        });
      }, 10); // Reduced delay for faster updates
    };

    editor.on('update', handleUpdate);

    socket.on('receive-changes', (update) => {
      if (update.userId !== localUser._id) {
        requestAnimationFrame(() => {
          editor.commands.setContent(update.content);
        });
      }
    });

    return () => {
      editor.off('update', handleUpdate);
      socket.off('receive-changes');
      clearTimeout(updateTimeout);
    };
  }, [documentId, editor, localUser._id]);

  useEffect(() => {
    const handleMouseMove = throttle((e) => {
      const editorContent = document.querySelector('.ProseMirror');
      if (!editorContent) return;

      const rect = editorContent.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left + editorContent.scrollLeft,
        y: e.clientY - rect.top + editorContent.scrollTop
      };

      requestAnimationFrame(() => {
        socket.emit('cursor-move', {
          documentId,
          position,
          userId: localUser._id,
          selection: getSelectionRect(editorContent)
        });
      });
    }, 16); // 60fps update rate

    const getSelectionRect = (editorContent) => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return null;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorContent.getBoundingClientRect();

      return {
        left: rect.left - editorRect.left + editorContent.scrollLeft,
        top: rect.top - editorRect.top + editorContent.scrollTop,
        width: rect.width,
        height: rect.height
      };
    };

    const editorContent = document.querySelector('.ProseMirror');
    if (editorContent) {
      editorContent.addEventListener('mousemove', handleMouseMove);
      editorContent.addEventListener('keyup', handleMouseMove);
      editorContent.addEventListener('click', handleMouseMove);
      editorContent.addEventListener('scroll', handleMouseMove);
    }

    return () => {
      if (editorContent) {
        editorContent.removeEventListener('mousemove', handleMouseMove);
        editorContent.removeEventListener('keyup', handleMouseMove);
        editorContent.removeEventListener('click', handleMouseMove);
        editorContent.removeEventListener('scroll', handleMouseMove);
      }
    };
  }, [documentId, localUser._id]);

  const CollaborativeCursor = ({ user }) => {
    if (!user.position || user.id === localUser._id) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 25
        }}
        style={{
          position: 'absolute',
          left: user.position.x,
          top: user.position.y,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Exact Figma cursor design */}
        <div style={{ position: 'relative' }}>
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
              transform: 'translate(-4px, -4px)',
            }}
          >
            <path
              d="M3.16669 2.33398L3.16669 23.334L7.83335 18.834L12.3334 25.834L15.8334 24.0007L11.3334 17.0007L16.8334 17.0007L3.16669 2.33398Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* Figma-style name tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.05,
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            style={{
              position: 'absolute',
              left: '20px',
              top: '-8px',
              background: user.color,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              transform: 'translateY(-100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'white',
                opacity: 0.7
              }}
            />
            {user.name}
          </motion.div>

          {/* Figma-style selection highlight */}
          {user.selection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                background: `${user.color}15`,
                border: `1.5px solid ${user.color}40`,
                borderRadius: '2px',
                ...user.selection,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  const handleAICompletion = async (text) => {
    if (!text.trim() || text === lastText) return;
    setLastText(text);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Complete this sentence naturally: "${text}"`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestion = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (suggestion) {
        setAiSuggestion(suggestion);
        setShowSuggestion(true);
      }
    } catch (error) {
      console.error("Error fetching AI completion:", error);
      if (error.response) {
        console.error("API Error Details:", error.response.data);
      }
    }
  };

  const acceptSuggestion = useCallback(() => {
    if (!editor || !aiSuggestion) return;
    
    editor.commands.insertContent(aiSuggestion);
    setShowSuggestion(false);
    setAiSuggestion("");
  }, [editor, aiSuggestion]);

  // Add connection status handling
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Update the triggerAISuggestion function with better prompting
  const triggerAISuggestion = useCallback(async () => {
    if (!editor) return;
    
    setIsLoading(true);
    const selection = editor.state.selection;
    const pos = editor.view.coordsAtPos(selection.anchor);
    setCursorPosition({ x: pos.left, y: pos.top });

    // Get better context for more accurate suggestions
    const text = editor.getText();
    const currentParagraph = text.split('\n').pop() || '';
    const previousParagraph = text.split('\n').slice(-2)[0] || '';
    setContext(currentParagraph);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Given this context from a document:
              Previous paragraph: "${previousParagraph}"
              Current paragraph: "${currentParagraph}"
              
              Continue the current paragraph naturally, maintaining the same:
              - Writing style and tone
              - Technical level
              - Context and theme
              
              Provide a concise, contextually relevant continuation that flows seamlessly.
              Response should be direct continuation without repetition.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
            topP: 0.9,
            topK: 40,
            stopSequences: ["\n", ".", "!", "?"]
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestion = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (suggestion) {
        setAiSuggestion(suggestion.trim());
        setShowSuggestion(true);
      }
    } catch (error) {
      console.error("Error fetching AI completion:", error);
      if (error.response) {
        console.error("API Error Details:", error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [editor]);

  return (
    <div className="min-h-screen bg-white">
      {/* Add AI status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
            isAIEnabled ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            AI {isAIEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <kbd className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
            ⌘/
          </kbd>
        </div>
      </div>

      {/* Update suggestion popup */}
      <AnimatePresence>
        {showSuggestion && isAIEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y + 24,
            }}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
              <div className="flex items-center gap-2 mb-3">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600">Thinking...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">AI Suggestion</span>
                  </>
                )}
              </div>
              
              {context && (
                <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Context: "{context}"
                </div>
              )}
              
              <p className="text-gray-700 mb-3 font-medium">
                {aiSuggestion}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Press ⌘/ for new suggestions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSuggestion(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Dismiss (Esc)
                  </button>
                  <button
                    onClick={acceptSuggestion}
                    className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-1"
                  >
                    <span>Accept</span>
                    <kbd className="text-xs bg-purple-600 px-1.5 py-0.5 rounded">⌘↵</kbd>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[90%] mx-auto p-4"
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <RiArrowLeftLine className="w-6 h-6 text-gray-600" />
          </button>

          <div className="relative group inline-block">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 group-hover:bg-gray-200 transition-colors">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none outline-none w-auto min-w-[200px]"
                placeholder="Untitled Document"
                disabled={userRole !== 'author' && userRole !== 'editor'}
              />
              {(userRole === 'author' || userRole === 'editor') && (
                <RiEdit2Line 
                  className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit title"
                />
              )}
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-white border-b mb-4 p-2 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {(userRole === 'author' || userRole === 'editor') ? (
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
              </>
            ) : (
              <div className="w-full text-center py-2 text-gray-500 bg-gray-50 rounded">
                {userRole === 'reviewer' ? 'Reviewer Access - Read Only' : 'Read Only Access'}
              </div>
            )}
          </div>

          {userRole === 'author' && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors ml-4"
              title="Share Document"
            >
              <RiShareLine className="w-5 h-5" />
              <span>Share</span>
            </button>
          )}
        </div>

        <div 
          className={`border rounded-lg overflow-hidden bg-white relative ${
            userRole === 'reader' || userRole === 'reviewer' ? 'cursor-default' : 'cursor-text'
          }`}
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent 
            editor={editor} 
            className={`prose max-w-none min-h-[calc(100vh-200px)] p-4 ${
              userRole === 'reader' || userRole === 'reviewer' ? 'select-text' : ''
            }`}
          />
          {Array.from(activeUsers.values()).map(user => (
            <CollaborativeCursor
              key={user.id}
              user={user}
            />
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

        <AnimatePresence>
          {(saveStatus.status === 'saving' || saveStatus.message === 'All changes saved') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 right-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-green-500 shadow-lg flex items-center justify-center cursor-pointer relative">
                {saveStatus.status === 'saving' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiCheckLine className="w-5 h-5 text-white" />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-gray-800 text-white text-sm rounded-lg py-1 px-3 whitespace-nowrap">
                    {saveStatus.message}
                  </div>
                  {/* Arrow */}
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default TextEditor; 