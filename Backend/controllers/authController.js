import * as userService from '../services/userService.js';
import * as tokenService from '../services/tokenService.js';
import * as emailService from '../services/emailService.js';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dns from 'dns/promises';

const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email address to login.' });
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
        force_password_reset: user.force_password_reset
      },
      resetRequired: !!user.force_password_reset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.user_id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear force_reset flag using userService logic directly or via model
    // Here we'll do a direct query for simplicity given the current structure, or assume userService has/needs a method
    // Let's rely on a direct query here to keep it contained, or better, add a method to userService.
    // Given previous pattern, let's do it here via pool or add to userService. 
    // I'll add a specific method to userService for this in the next step, but for now let's assume direct update here to be quick
    // Actually, let's use userService.updateUserPassword if it existed, but since it doesn't, let's import pool.
    // Wait, authController imports userService. Let's add updatePassword to userService.
    
    await userService.updateUserPassword(userId, hashedPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

export const logout = async (req, res) => {
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
    const added = await tokenService.addTokenToBlacklist(token, decoded.user_id, expiresAt);
    
    if (!added) {
      console.warn('Failed to add token to blacklist, but proceeding with logout');
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

export const cleanupTokens = async (req, res) => {
  try {
    const cleanedCount = await tokenService.cleanupExpiredTokens();
    res.json({ 
      message: 'Token cleanup completed', 
      cleaned_tokens: cleanedCount 
    });
  } catch (error) {
    console.error('Token cleanup error:', error);
    res.status(500).json({ message: 'Error during token cleanup' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const connection = await pool.getConnection();
  try {
    // Check if user exists
    const [users] = await connection.query('SELECT user_id FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log(`⚠️ Forgot Password: User with email ${email} not found.`);
      return res.json({ message: 'If your email is registered, you will receive an OTP shortly.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to DB (invalidate old OTPs for this email)
    await connection.query('DELETE FROM otp_store WHERE email = ?', [email]);
    await connection.query('INSERT INTO otp_store (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresAt]);

    // Send Email
    const emailSent = await emailService.sendOTPEmail(email, otp);
    if (emailSent) {
      console.log(`✅ OTP sent to ${email}`);
    } else {
      console.error(`❌ Failed to send OTP to ${email}`);
    }

    res.json({ message: 'If your email is registered, you will receive an OTP shortly.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    connection.release();
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const connection = await pool.getConnection();
  try {
    // Verify OTP
    const [records] = await connection.query(
      'SELECT * FROM otp_store WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query(
      'UPDATE user SET password = ?, force_password_reset = 0 WHERE email = ?',
      [hashedPassword, email]
    );

    // Delete used OTP
    await connection.query('DELETE FROM otp_store WHERE email = ?', [email]);

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  } finally {
    connection.release();
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, manager_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['ADMIN'].includes(role)) {
       return res.status(403).json({ message: 'Public registration is restricted. Managers and Workers must be created by an Admin.' });
    }

    // 1. Check if user exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 2. MX Record Check
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ message: 'Invalid email domain' });
      }
    } catch (error) {
       console.error('DNS check failed:', error);
       return res.status(400).json({ message: 'Invalid email domain or DNS error' });
    }

    // 3. Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Create User (unverified)
    const user = await userService.createUserWithVerification(name, email, password, role, verificationToken, manager_id);

    // 5. Send Verification Email
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      return res.status(201).json({ message: 'User created, but failed to send verification email. Please contact support.' });
    }

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await userService.findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    await userService.verifyUser(user.user_id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?verified=true`);
  } catch (error) {
    console.error('Verification error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=verification_failed`);
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // 1. Check if user exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 2. Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Create User (ADMIN role, unverified initially)
    // Note: Admin might expect to be auto-verified, but for consistency let's require verification.
    // If you want auto-verified, change verificationToken to NULL and is_verified to TRUE in a different method,
    // or just use `createUser` (which defaults to unverified? No, `createUser` in `userService` doesn't support verification fields explicitly in the INSERT if I didn't update it to do so... wait.)
    // `userService.createUser` uses: INSERT INTO user (name, email, password, role, manager_id) ... 
    // The DB default for is_verified is 0.
    // So `createUser` creates an unverified user with NULL token.
    // I should use `createUserWithVerification`.
    
    // Let's stick to verification for Admin too, it's safer.
    const user = await userService.createUserWithVerification(name, email, password, 'ADMIN', verificationToken, null);

    // 4. Send Verification Email
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      return res.status(201).json({ message: 'Admin created, but failed to send verification email. Please contact support.' });
    }

    res.status(201).json({ message: 'Admin registration successful. Please check your email to verify your account.' });

  } catch (error) {
    console.error('Admin Registration error:', error);
    res.status(500).json({ message: 'Error during admin registration' });
  }
};
