import express from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedback.controller.js';

const router = express.Router();

// Submit feedback
router.post('/submit', submitFeedback);

// Get feedback
router.get('/:documentId', getFeedback);

export default router;