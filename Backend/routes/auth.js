import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Login endpoint
router.post('/login', authController.login);

// Logout endpoint
router.post('/logout', verifyToken, authController.logout);

// Change password endpoint
router.put('/change-password', verifyToken, authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Optional: Token cleanup endpoint (can be called periodically)
router.post('/cleanup-tokens', authController.cleanupTokens);

// Registration and Verification
router.post('/register', authController.register);
router.post('/register-admin', authController.registerAdmin);
router.get('/verify-email', authController.verifyEmail);

export default router;