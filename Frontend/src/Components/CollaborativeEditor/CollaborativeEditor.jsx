import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Users } from 'lucide-react';
import io from 'socket.io-client';
import './CollaborativeEditor.css';

const CollaborativeEditor = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('<p>Start writing your story here...</p>');
  const [userCount, setUserCount] = useState(0);
  const [typingStatus, setTypingStatus] = useState('');
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const TYPING_TIMEOUT = 1000;

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    // Connect to Socket.IO server
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    // Initialize editor with content from server
    socketRef.current.on('init-content', (initialContent) => {
      setContent(initialContent || '<p>Start writing your story here...</p>');
    });

    // Update user count
    socketRef.current.on('user-count', (count) => {
      setUserCount(count);
    });

    // Handle content updates from other users
    socketRef.current.on('content-update', (newContent) => {
      if (editorRef.current && editorRef.current.innerHTML !== newContent) {
        setContent(newContent);
      }
    });

    // Handle typing status
    socketRef.current.on('user-typing', () => {
      setTypingStatus('Someone is typing...');
    });

    socketRef.current.on('user-stop-typing', () => {
      setTypingStatus('');
    });

    // Clean up socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleEditorChange = (e) => {
    const newContent = editorRef.current.innerHTML;

    // Emit content changes
    socketRef.current.emit('content-change', newContent);

    // Handle typing status
    socketRef.current.emit('typing');

    // Clear previous typing timer
    clearTimeout(typingTimerRef.current);

    // Set new typing timer
    typingTimerRef.current = setTimeout(() => {
      socketRef.current.emit('stop-typing');
    }, TYPING_TIMEOUT);
  };

  const handleSaveClick = () => {
    const content = editorRef.current.innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collaborative-story.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearClick = () => {
    if (window.confirm('Are you sure you want to clear the story? This cannot be undone.')) {
      const newContent = '<p>Start writing your story here...</p>';
      setContent(newContent);
      socketRef.current.emit('content-change', newContent);
    }
  };

  const handleEditorFocus = () => {
    if (editorRef.current.innerHTML === '<p>Start writing your story here...</p>') {
      editorRef.current.innerHTML = '<p></p>';
    }
  };

  const handleEditorBlur = () => {
    if (editorRef.current.innerHTML === '<p></p>' || editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = '<p>Start writing your story here...</p>';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="collaborative-editor-overlay">
      <div className="collaborative-editor-container">
        <header className="editor-modal-header">
          <h2>Collaborative Story Writer</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="status-bar">
          <div className="connected-users">
            <Users size={18} />
            <span>Connected Users: {userCount}</span>
          </div>
          <div className="typing-status">{typingStatus}</div>
        </div>

        <div className="editor-container">
          <div className="editor-header">
            <button className="save-btn" onClick={handleSaveClick}>
              <Save size={16} />
              Save Story
            </button>
            <button className="clear-btn" onClick={handleClearClick}>
              Clear Story
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable="true"
            className="editor"
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleEditorChange}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
          />
        </div>

        <div className="instructions">
          <h3>How to Use:</h3>
          <ul>
            <li>Start typing in the editor above to contribute to the story</li>
            <li>Changes are automatically synced with other users</li>
            <li>You can see when others are typing</li>
            <li>Use the Save button to download the story</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor; 