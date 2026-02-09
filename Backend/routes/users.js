import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { checkUserHierarchy } from '../middleware/hierarchy.js';
import { 
  registerUser, 
  getAllUsers, 
  getAllManagers, 
  getAllWorkers, 
  getUserById, 
  getManagerWorkers, 
  updateUser, 
  deleteUser,
  getProfile
} from '../controllers/userController.js';

const router = express.Router();

// Register a new user (ADMIN only)
router.post('/register', verifyToken, authorize('ADMIN'), registerUser);

// Get all users (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), getAllUsers);

// Get all managers (ADMIN only)
router.get('/managers', verifyToken, authorize('ADMIN'), getAllManagers);

// Get all workers (ADMIN only)
router.get('/workers', verifyToken, authorize('ADMIN'), getAllWorkers);

// Get current user profile
router.get('/profile', verifyToken, getProfile);

// Get user by ID
router.get('/:user_id', verifyToken, checkUserHierarchy, getUserById);

// Get workers under a manager
router.get('/manager/:manager_id/workers', verifyToken, authorize('ADMIN', 'MANAGER'), getManagerWorkers);

// Update user (ADMIN or self)
router.put('/:user_id', verifyToken, updateUser);

// Delete user (ADMIN only)
router.delete('/:user_id', verifyToken, authorize('ADMIN'), deleteUser);

export default router;
