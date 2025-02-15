import express from 'express';
import Document from '../models/Document.js';
import UserFiles from '../models/UserFiles.js';
import { nanoid } from 'nanoid';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { sendShareEmail } from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function for timestamps
const getCurrentISTTime = () => {
  return new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
};

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
      readerAccess: [],
      metadata: req.body.metadata || {},
      createdAt: getCurrentISTTime(),
      lastModified: getCurrentISTTime()
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

// Get shared documents
router.get('/shared', auth, async (req, res) => {
  try {
    const userFiles = await UserFiles.findOne({ userId: req.user._id })
      .populate({
        path: 'filesShared',
        options: { sort: { 'lastModified': -1 } },
        limit: 10,
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    if (!userFiles) {
      return res.json({ documents: [] });
    }

    const documents = userFiles.filesShared || [];
    res.json({ documents });
    
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    res.status(500).json({ message: 'Error fetching shared documents' });
  }
});

// Get document by documentId
router.get('/:documentId', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ 
      documentId: req.params.documentId 
    }).populate('author', 'name email');
    console.log(document);

    if (!document) {
      return res.status(404).json({ message: 'Document not found', error: error.message });
    }

    // Convert document to a plain object to modify it
    const docObject = document.toObject();
    
    // Add author's _id to the response
    docObject.author = document.author?._id || document.author;

    res.json(docObject);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Update document by documentId
router.put('/:documentId', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findOneAndUpdate(
      { documentId: req.params.documentId },
      { 
        $set: { 
          title, 
          content,
          lastModified: getCurrentISTTime()
        } 
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
});

// Share document
router.post('/:documentId/share', auth, async (req, res) => {
  try {
    const { email, accessLevel } = req.body;
    const documentId = req.params.documentId;
    
    // Find the document using documentId field
    const document = await Document.findOne({ documentId });
    
    if (!document) {
      console.log('Document not found:', documentId);
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is the author (compare as strings)
    if (document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the author can share this document' });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from all access arrays first
    document.editorAccess = document.editorAccess.filter(id => 
      id.toString() !== userToShare._id.toString()
    );
    document.reviewerAccess = document.reviewerAccess.filter(id => 
      id.toString() !== userToShare._id.toString()
    );
    document.readerAccess = document.readerAccess.filter(id => 
      id.toString() !== userToShare._id.toString()
    );

    // Add user to appropriate access array
    switch (accessLevel) {
      case 'editor':
        document.editorAccess.push(userToShare._id);
        break;
      case 'reviewer':
        document.reviewerAccess.push(userToShare._id);
        break;
      case 'reader':
        document.readerAccess.push(userToShare._id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid access level' });
    }

    // Save the document
    await document.save();

    // Send success response before email
    res.json({ 
      message: `Document shared with ${email} as ${accessLevel}`,
      document
    });

    // Send email notification after response
    await sendShareEmail(
      email,
      document.title,
      req.user.name,
      accessLevel,
      documentId
    );

  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ 
      message: 'Error sharing document',
      error: error.message 
    });
  }
});

// Get document users
router.get('/:documentId/users', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.documentId })
      .populate('author', 'name email')
      .populate('editorAccess', 'name email')
      .populate('reviewerAccess', 'name email')
      .populate('readerAccess', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const users = [
      { ...document.author.toObject(), role: 'Author' },
      ...document.editorAccess.map(user => ({ ...user.toObject(), role: 'Editor' })),
      ...document.reviewerAccess.map(user => ({ ...user.toObject(), role: 'Reviewer' })),
      ...document.readerAccess.map(user => ({ ...user.toObject(), role: 'Reader' }))
    ];

    res.json({ users });
  } catch (error) {
    console.error('Error fetching document users:', error);
    res.status(500).json({ message: 'Error fetching document users' });
  }
});

// Add this POST route for creating documents
router.post('/', async (req, res) => {
  try {
    const { title, content, templateId, metadata } = req.body;
    
    const documentId = nanoid(16);
    
    // Create document with minimal required fields
    const document = new Document({
      documentId,
      title: title || 'Untitled Document',
      data: content,
      templateId,
      metadata,
      editorAccess: [],
      reviewerAccess: [],
      readerAccess: [],
      createdAt: getCurrentISTTime(),
      lastModified: getCurrentISTTime()
    });
    
    const savedDoc = await document.save();

    res.status(201).json({
      documentId: savedDoc.documentId,
      message: 'Document created successfully'
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ 
      error: 'Failed to create document',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/api/documents', auth, async (req, res) => {
  try {
    const { title, content, metadata } = req.body;
    
    // Generate a unique document ID
    const documentId = generateUniqueId(); // implement this function
    
    const newDocument = new Document({
      documentId,
      title: title || 'Untitled Document',
      content,
      author: req.user._id,
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newDocument.save();

    res.status(201).json({
      message: 'Document created successfully',
      documentId: newDocument.documentId
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ 
      message: 'Error creating document',
      error: error.message 
    });
  }
});

// Delete document by documentId
router.delete('/:documentId', auth, async (req, res) => {
  try {
    // Find document first to get its details
    const document = await Document.findOne({ documentId: req.params.documentId });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is authorized to delete (only author can delete)
    console.log(document);
    if (document?.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Unauthorized: Only the document author can delete this document' 
      });
    }

    // Start a session for transaction
    const session = await Document.startSession();
    session.startTransaction();

    try {
      // Delete document
      await Document.findOneAndDelete({ documentId: req.params.documentId }, { session });

      // Remove document reference from UserFiles for author
      await UserFiles.updateOne(
        { userId: document.author },
        { 
          $pull: { 
            filesCreated: document._id,
            filesShared: document._id 
          } 
        },
        { session }
      );

      // Remove document reference from UserFiles for all users who had access
      const usersWithAccess = [
        ...document.editorAccess,
        ...document.reviewerAccess,
        ...document.readerAccess
      ];

      if (usersWithAccess.length > 0) {
        await UserFiles.updateMany(
          { userId: { $in: usersWithAccess } },
          { 
            $pull: { 
              filesShared: document._id 
            } 
          },
          { session }
        );
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.json({ 
        message: 'Document deleted successfully',
        documentId: req.params.documentId 
      });

    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      message: 'Error deleting document',
      error: error.message 
    });
  }
});

// Remove user access from document
router.delete('/:documentId/access/:userId', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.documentId });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if requester is the author
    if (document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only the author can remove access' 
      });
    }

    // Remove user from all access arrays
    document.editorAccess = document.editorAccess.filter(
      id => id.toString() !== req.params.userId
    );
    document.reviewerAccess = document.reviewerAccess.filter(
      id => id.toString() !== req.params.userId
    );
    document.readerAccess = document.readerAccess.filter(
      id => id.toString() !== req.params.userId
    );

    // Remove document from user's shared files
    await UserFiles.updateOne(
      { userId: req.params.userId },
      { $pull: { filesShared: document._id } }
    );

    await document.save();

    res.json({ 
      message: 'User access removed successfully',
      document 
    });

  } catch (error) {
    console.error('Error removing user access:', error);
    res.status(500).json({ 
      message: 'Error removing user access',
      error: error.message 
    });
  }
});

export default router; 