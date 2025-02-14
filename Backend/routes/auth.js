import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Example Google login route (adjust the logic as needed)
router.post("/google-login", async (req, res) => {
  try {
    // In a real implementation, verify the Google token and fetch user info.
    // For demonstration, we'll assume the login is successful and mock a user.
    const userData = {
      _id: "exampleUserId",
      email: "user@example.com",
      name: "Subrat Jain",
      picture: "https://example.com/user.png"
    };

    const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error in /api/auth/google-login:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
