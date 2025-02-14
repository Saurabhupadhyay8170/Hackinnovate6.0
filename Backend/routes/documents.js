import express from 'express';
import Document from '../models/Document.js';
import { nanoid } from 'nanoid';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create new document
router.post('/create', auth, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user); // Debug log

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated or invalid user ID' });
    }

    const documentId = nanoid(16);
    const document = new Document({
      documentId,
      owner: req.user._id, // Use _id from auth middleware
      title: 'Untitled Document',
      content: ''
    });
    
    console.log('Document before save:', document); // Debug log
    
    const savedDoc = await document.save();
    console.log('Saved document:', savedDoc); // Debug log
    
    res.status(201).json({ 
      documentId: savedDoc.documentId,
      message: 'Document created successfully' 
    });
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ 
      message: 'Error creating document',
      error: error.message 
    });
  }
});

// Get document
router.get('/:documentId', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.documentId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Update document
router.put('/:documentId', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findOneAndUpdate(
      { documentId: req.params.documentId },
      { 
        title, 
        content,
        lastModified: new Date()
      },
      { new: true }
    );
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document' });
  }
});

export default router; 