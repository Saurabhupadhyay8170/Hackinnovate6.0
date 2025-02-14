import express from 'express';
import Document from '../models/Document.js';
import UserFiles from '../models/UserFiles.js';
import { nanoid } from 'nanoid';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create new document
router.post('/create', auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const documentId = nanoid(16);
    const document = new Document({
      documentId,
      author: req.user._id,
      title: 'Untitled Document',
      content: '',
      editorAccess: [],
      reviewerAccess: [],
      readerAccess: []
    });
    
    const savedDoc = await document.save();

    // Update or create UserFiles document
    await UserFiles.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $push: { filesCreated: savedDoc._id },
        $setOnInsert: { userId: req.user._id }
      },
      { upsert: true, new: true }
    );
    
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

// Get recent documents
router.get('/recent', auth, async (req, res) => {
  try {
    const userFiles = await UserFiles.findOne({ userId: req.user._id })
      .populate({
        path: 'filesCreated',
        options: { sort: { 'lastModified': -1 } },
        limit: 10
      });

    if (!userFiles) {
      return res.json({ documents: [] });
    }

    const documents = userFiles.filesCreated.map(doc => ({
      _id: doc._id,
      documentId: doc.documentId,
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.lastModified
    }));

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    res.status(500).json({ message: 'Error fetching recent documents' });
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