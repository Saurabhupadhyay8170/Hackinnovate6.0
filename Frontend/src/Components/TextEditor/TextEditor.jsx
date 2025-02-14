import React, { useState, useEffect, useCallback } from 'react';
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
  RiShareLine
} from 'react-icons/ri';
import api from '../../utils/api';
import ShareModal from '../ShareModal/ShareModal';

function TextEditor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const [saveStatus, setSaveStatus] = useState({ status: 'saved', message: 'All changes saved' });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

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
    content: '',
    autofocus: true,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      handleContentChange(content);
    },
  });

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
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => handleTitleChange(e.target.value)}
            className="w-full text-3xl font-bold p-2 border-none outline-none bg-transparent group-hover:bg-gray-50 rounded transition-colors"
            placeholder="Untitled Document"
          />
        </div>

        <div className="sticky top-0 z-40 bg-white border-b mb-4 p-2 flex flex-wrap gap-2">
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

          
        </div>

        <div 
          className="border rounded-lg overflow-hidden bg-white"
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent 
            editor={editor} 
            className="prose max-w-none min-h-[calc(100vh-200px)] p-4"
          />
        </div>

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