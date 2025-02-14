import React, { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { CodemirrorBinding } from 'y-codemirror';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';

const TextEditor = ({ roomId }) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    
    // Connect to WebSocket server for sync
    const provider = new WebsocketProvider(
      'ws://localhost:1234', // Replace with your WebSocket server URL
      roomId,
      ydoc
    );

    // Initialize CodeMirror
    const editor = CodeMirror(editorRef.current, {
      mode: 'javascript',
      theme: 'material',
      lineNumbers: true,
      lineWrapping: true,
    });

    editorInstanceRef.current = editor;

    // Get shared text from Yjs
    const ytext = ydoc.getText('codemirror');

    // Bind CodeMirror and Yjs
    const binding = new CodemirrorBinding(ytext, editor, provider.awareness);

    // Cleanup on unmount
    return () => {
      if (binding) {
        binding.destroy();
      }
      ydoc.destroy();
      provider.destroy();
    };
  }, [roomId]);

  return (
    <div className="text-editor">
      <div ref={editorRef} />
    </div>
  );
};

export default TextEditor;
