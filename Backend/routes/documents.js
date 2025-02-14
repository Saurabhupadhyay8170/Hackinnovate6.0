import express from 'express';
import { findOrCreateDocument } from './controllers/Document.controllers.js';


const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { documentId, documentName } = req.body;
    if (!documentId || !documentName) {
      return res.status(400).json({ error: "documentId and documentName are required" });
    }
    const document = await findOrCreateDocument({ documentId, documentName });
    res.status(201).json({ documentId: document._id });
  } catch (error) {
    console.error("Error in /api/documents/create:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
