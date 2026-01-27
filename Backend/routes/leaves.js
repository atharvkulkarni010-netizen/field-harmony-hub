import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply for leave (Workers)
router.post('/', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const { user } = req;

    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Start date, end date, and reason are required' });
    }

    const leave = await Leave.create(user.user_id, start_date, end_date, reason);
    res.status(201).json({ message: 'Leave application submitted', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error applying for leave' });
  }
});

// Get leave requests for worker
router.get('/worker/:worker_id', verifyToken, async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own leave requests' });
    }

    if (user.role === 'MANAGER') {
      const worker = await User.findById(worker_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers leave requests' });
      }
    }

    const leaves = await Leave.findByUser(worker_id);
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
});

// Get pending leave requests
router.get('/pending/all', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { user } = req;

    let leaves;
    if (user.role === 'ADMIN') {
      leaves = await Leave.findPending();
    } else {
      leaves = await Leave.findPendingForManager(user.user_id);
    }

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending leave requests' });
  }
});

// Approve leave (Manager or ADMIN)
router.patch('/:leave_id/approve', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { user } = req;

    const leave = await Leave.findById(leave_id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (user.role === 'MANAGER') {
      const worker = await User.findById(leave.user_id);
      if (worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only approve your workers leave requests' });
      }
    }

    const approved = await Leave.approve(leave_id, user.user_id);
    res.json({ message: 'Leave approved', leave: approved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving leave' });
  }
});

// Reject leave (Manager or ADMIN)
router.patch('/:leave_id/reject', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { user } = req;

    const leave = await Leave.findById(leave_id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (user.role === 'MANAGER') {
      const worker = await User.findById(leave.user_id);
      if (worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only reject your workers leave requests' });
      }
    }

    const rejected = await Leave.reject(leave_id);
    res.json({ message: 'Leave rejected', leave: rejected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rejecting leave' });
  }
});

// Get leave by ID
router.get('/:leave_id', verifyToken, async (req, res) => {
  try {
    const { leave_id } = req.params;
    const leave = await Leave.findById(leave_id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Permission check
    if (req.user.role === 'WORKER' && leave.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own leave requests' });
    }

    res.json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching leave request' });
  }
});

export default router;
