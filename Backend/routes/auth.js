import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

const router = express.Router();
const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager_id: user.manager_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Logout endpoint
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode token to get expiration time and user info
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Add token to blacklist
    const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds
    const added = await TokenBlacklist.addToBlacklist(token, decoded.user_id, expiresAt);
    
    if (!added) {
      console.warn('Failed to add token to blacklist, but proceeding with logout');
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

// Optional: Token cleanup endpoint (can be called periodically)
router.post('/cleanup-tokens', async (req, res) => {
  try {
    const cleanedCount = await TokenBlacklist.cleanupExpiredTokens();
    res.json({ 
      message: 'Token cleanup completed', 
      cleaned_tokens: cleanedCount 
    });
  } catch (error) {
    console.error('Token cleanup error:', error);
    res.status(500).json({ message: 'Error during token cleanup' });
  }
});

export default router;