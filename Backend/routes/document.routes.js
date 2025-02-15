import express from 'express';
import Document from './models/Document.js';  // Update the import path

const router = express.Router();

// POST /documents - Create a new document
router.post('/', async (req, res) => {
  try {
    const { title, content, template } = req.body;
    const author = req.user?._id; // Make author optional for now

    const document = await Document.create({
      title,
      content,
      template,
      author,
      data: content, // Add this line to match existing Document model
      editorAccess: [],
      reviewerAccess: []
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

export default router; 