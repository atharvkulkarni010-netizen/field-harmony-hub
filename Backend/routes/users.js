import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyToken, authorize } from '../middleware/auth.js';
import { checkUserHierarchy } from '../middleware/hierarchy.js';

const router = express.Router();
const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user (ADMIN only)
router.post('/register', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role, manager_id } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create(name, email, password, role, manager_id || null);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login
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

// Get all users (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.findAll(role);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:user_id', verifyToken, checkUserHierarchy, async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Get workers under a manager
router.get('/manager/:manager_id/workers', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { manager_id } = req.params;
    const { user } = req;

    // Managers can only see their own workers
    if (user.role === 'MANAGER' && user.user_id != manager_id) {
      return res.status(403).json({ message: 'You can only view your own workers' });
    }

    const workers = await User.findByManager(manager_id);
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching workers' });
  }
});

// Update user (ADMIN or self)
router.put('/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user } = req;

    // Can only update self or be admin
    if (user.user_id != user_id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { name, email, role, manager_id } = req.body;
    const updatedUser = await User.update(user_id, { name, email, role, manager_id });
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (ADMIN only)
router.delete('/:user_id', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { user_id } = req.params;
    await User.delete(user_id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
