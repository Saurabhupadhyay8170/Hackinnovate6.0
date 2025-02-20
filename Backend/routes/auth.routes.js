import express from 'express';
import {googleLogin, userStats, getAllUsers} from '../controllers/auth.controller.js'; 
import auth from '../middleware/auth.js';
const router = express.Router();

router.post('/google-login', googleLogin );

// Add a route to get user stats
router.get('/user-stats/:userId', userStats);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

router.get('/users', auth, getAllUsers);

export default router;