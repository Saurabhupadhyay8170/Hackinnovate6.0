import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const googleLogin = async (req, res) => {
    try {
      const { email, name, picture, googleId, token } = req.body;
  
      // Validate required fields
      if (!email || !name || !googleId) {
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
};

export const userStats = async (req, res) => {
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
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email picture visitCount lastVisit createdAt')
      .sort({ lastVisit: -1 });

    res.status(200).json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

