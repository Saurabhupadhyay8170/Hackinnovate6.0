import express from 'express';
import auth from '../middleware/auth.js';
import { createDocument, getRecentDocuments, getSharedDocuments, getDocumentById, updateDocument, shareDocument, getDocumentUsers, deleteDocument, removeUserAccess, checkDocumentAccess } from '../controllers/document.controller.js';

const router = express.Router();

// Create new document
router.post('/create', auth, createDocument);

// Get recent documents
router.get('/recent', auth, getRecentDocuments);

// Get shared documents
router.get('/shared', auth, getSharedDocuments);

// Get document by documentId
router.get('/:documentId', auth, getDocumentById);

// Update document by documentId
router.put('/:documentId', auth, updateDocument);

// Share document
router.post('/:documentId/share', auth, shareDocument);

// Get document users
router.get('/:documentId/users', auth, getDocumentUsers);

// Delete document by documentId
router.delete('/:documentId', auth, deleteDocument);

// Remove user access from document
router.delete('/:documentId/access/:userId', auth, removeUserAccess);

// Check document access
router.get('/:documentId/access', auth, checkDocumentAccess);

export default router; 