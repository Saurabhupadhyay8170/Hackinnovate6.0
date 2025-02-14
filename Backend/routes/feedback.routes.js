import express from 'express';
import Feedback from '../models/Feedback.model.js';

const router = express.Router();

// POST /api/feedback/submit
// Expects { documentId, vote, suggestion, userId (optional) } in the request body.
router.post('/submit', async (req, res) => {
  try {
    const { documentId, vote, suggestion, userId } = req.body;
    if (!documentId || typeof vote !== 'number') {
      return res.status(400).json({ error: "documentId and vote are required" });
    }
    
    // Create a new feedback entry
    const feedback = await Feedback.create({
      documentId,
      vote,
      suggestion,
      user: userId || null,
    });
    
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
