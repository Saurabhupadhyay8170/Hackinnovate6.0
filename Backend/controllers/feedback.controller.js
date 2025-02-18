import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  try {
    const { documentId, vote, suggestion, userId, username } = req.body;
    if (!documentId || typeof vote !== 'number') {
      return res.status(400).json({ error: "documentId and vote are required" });
    }
    
    // Create a new feedback entry
    const feedback = await Feedback.create({
      documentId,
      vote,
      suggestion,
      user: userId || null,
      username,
    });
    
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Retrieves all feedback for a specific document
export const getFeedback = async (req, res) => {
  try {
    const { documentId } = req.params;
    const feedback = await Feedback.find({ documentId })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

