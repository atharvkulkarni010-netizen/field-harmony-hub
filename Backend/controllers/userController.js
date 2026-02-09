import * as userService from '../services/userService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { generateRandomPassword } from '../utils/passwordUtils.js';
import crypto from 'crypto';

export const registerUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Validate role
    if (!['ADMIN', 'MANAGER', 'WORKER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be ADMIN, MANAGER, or WORKER' });
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const randomPassword = generateRandomPassword();
    
    // Handle manager_id based on role
    let manager_id = null;
    if (role === 'WORKER') {
      // For workers, manager_id is required
      manager_id = req.body.manager_id;
      
      // Validate that manager_id is provided
      if (!manager_id) {
        return res.status(400).json({ message: 'manager_id is required for WORKER role' });
      }
      
      // Validate that manager_id exists and references a valid manager
      const manager = await userService.findUserById(manager_id);
      if (!manager || manager.role !== 'MANAGER') {
        return res.status(400).json({ message: 'Invalid manager_id. Must reference a valid manager.' });
      }
    }
    // For ADMIN and MANAGER roles, manager_id is always null

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create User with Verification Token (is_verified = false)
    const user = await userService.createUserWithVerification(name, email, randomPassword, role, verificationToken, manager_id);
    
    // Send welcome email with credentials AND verification link
    await sendWelcomeEmail(email, name, randomPassword, role, verificationToken);

    // Return the user info without the password field
    res.status(201).json({ 
      message: 'User created successfully. A verification email has been sent.', 
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager_id: user.manager_id,
        created_at: user.created_at
      },
      generatedPassword: randomPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await userService.findAllUsers(role);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getAllManagers = async (req, res) => {
  try {
    const managers = await userService.findAllUsers('MANAGER');
    res.json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching managers' });
  }
};

export const getAllWorkers = async (req, res) => {
  try {
    const workers = await userService.findAllUsers('WORKER');
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching workers' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await userService.findUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const getManagerWorkers = async (req, res) => {
  try {
    const { manager_id } = req.params;
    const { user } = req;

    // Managers can only see their own workers
    if (user.role === 'MANAGER' && user.user_id != manager_id) {
      return res.status(403).json({ message: 'You can only view your own workers' });
    }

    const workers = await userService.findUsersByManager(manager_id);
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching workers' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user } = req;

    // Can only update self or be admin
    if (user.user_id != user_id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { name, email, role, manager_id } = req.body;
    const updatedUser = await userService.updateUser(user_id, { name, email, role, manager_id });
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    await userService.deleteUser(user_id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await userService.findUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For workers, fetch manager details
    let manager = null;
    if (user.role === 'WORKER' && user.manager_id) {
        manager = await userService.findUserById(user.manager_id);
    }
    
    // For managers, count workers
    let workersCount = 0;
    if (user.role === 'MANAGER') {
        const workers = await userService.findUsersByManager(user_id);
        workersCount = workers?.length || 0;
    }

    res.json({ ...user, manager, workersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};
