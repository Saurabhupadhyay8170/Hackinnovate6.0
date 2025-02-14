import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/google-login', async (req, res) => {
  try {
    const { email, name, picture, sub: googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        visitCount: user.visitCount 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        visitCount: user.visitCount,
        lastVisit: user.lastVisit
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
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