import Document from '../models/Document.js';
import UserFiles from '../models/UserFiles.js';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';

// Helper function for timestamps
const getCurrentISTTime = () => {
  return new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
};

export const createDocument = async (req, res) => {
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
};

export const getRecentDocuments = async (req, res) => {
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
};

export const getSharedDocuments = async (req, res) => {
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
};

export const getDocumentById = async (req, res) => {
    try {
      const document = await Document.findOne({ 
        documentId: req.params.documentId 
      }).populate('author', 'name email');
      // console.log(document);
  
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
};

export const updateDocument = async (req, res) => {
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
};

export const shareDocument = async (req, res) => {
    try {
      const { documentId } = req.params;
      const { email, accessLevel } = req.body;
      
      const document = await Document.findOne({ documentId });
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      const userToShare = await User.findOne({ email });
      if (!userToShare) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update document access
      const updateQuery = { $addToSet: {} };
      updateQuery.$addToSet[`${accessLevel}Access`] = userToShare._id;
      
      await Document.findByIdAndUpdate(document._id, updateQuery);
  
      // Update UserFiles for shared user
      await UserFiles.findOneAndUpdate(
        { userId: userToShare._id },
        { 
          $addToSet: { filesShared: document._id },
          $setOnInsert: { userId: userToShare._id }
        },
        { upsert: true }
      );
  
      // Get IO instance and emit update
      const io = getIO();
      io.emit('share-update', {
        documentId,
        sharedWith: email,
        accessLevel
      });
  
      res.json({ message: 'Document shared successfully' });
    } catch (error) {
      console.error('Error sharing document:', error);
      res.status(500).json({ message: 'Error sharing document' });
    }
};

export const getDocumentUsers = async (req, res) => {
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
};

export const deleteDocument = async (req, res) => {
    try {
      // Find document first to get its details
      const document = await Document.findOne({ documentId: req.params.documentId });
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      // Check if user is authorized to delete (only author can delete)
      // console.log(document);
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
};

export const removeUserAccess = async (req, res) => {
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
};

export const checkDocumentAccess = async (req, res) => {
    try {
      const { documentId } = req.params;
      const userId = req.user._id;
  
      const document = await Document.findOne({ documentId });
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      // Check if user has any level of access
      const hasAccess = 
        document.author.toString() === userId ||
        document.editorAccess.includes(userId) ||
        document.reviewerAccess.includes(userId) ||
        document.readerAccess.includes(userId);
  
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'You do not have permission to access this document' 
        });
      }
  
      res.json({ message: 'Access granted' });
    } catch (error) {
      console.error('Error checking document access:', error);
      res.status(500).json({ message: 'Server error' });
    }
};
      