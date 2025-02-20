import express from 'express';
import {googleLogin, userStats} from '../controllers/auth.controller.js'; 
const router = express.Router();

router.post('/google-login', googleLogin );

// Add a route to get user stats
router.get('/user-stats/:userId', userStats);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;