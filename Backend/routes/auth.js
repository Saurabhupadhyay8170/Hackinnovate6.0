import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/google-login', async (req, res) => {
  try {
    const { email, name, picture, googleId, token } = req.body;

    // Validate required fields
    if (!email || !name || !googleId) {
      console.log('Received data:', req.body); // Debug log
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { email, name, googleId }
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        visitCount: 1,
        lastVisit: new Date()
      });
    } else {
      // Update existing user's info and increment visit count
      user.name = name;
      user.picture = picture;
      user.googleId = googleId;
      user.visitCount += 1;
      user.lastVisit = new Date();
      await user.save();
    }

    // Generate JWT token with MongoDB _id
    const jwtToken = jwt.sign(
      { 
        _id: user._id, // Include MongoDB _id
        email,
        name,
        sub: googleId,
        picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        _id: user._id,  // MongoDB ObjectId
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      message: 'Error processing login',
      error: error.message 
    });
  }
});

// Add a route to get user stats
router.get('/user-stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      visitCount: user.visitCount,
      lastVisit: user.lastVisit,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;