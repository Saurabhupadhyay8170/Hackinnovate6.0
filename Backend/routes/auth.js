import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Example Google login route (adjust the logic as needed)
router.post("/google-login", async (req, res) => {
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
    console.error("Error in /api/auth/google-login:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
