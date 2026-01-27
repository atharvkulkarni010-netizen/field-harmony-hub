import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Check in (Workers)
router.post('/check-in', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { date, check_in_time, check_in_latitude, check_in_longitude } = req.body;
    const { user } = req;

    const existing = await Attendance.findByUserAndDate(user.user_id, date);
    if (existing) {
      return res.status(400).json({ message: 'Already checked in for this date' });
    }

    const attendance = await Attendance.create(
      user.user_id,
      date,
      check_in_time,
      check_in_latitude,
      check_in_longitude,
      'PRESENT'
    );

    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during check-in' });
  }
});

// Check out (Workers)
router.patch('/:attendance_id/check-out', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { check_out_time, check_out_latitude, check_out_longitude } = req.body;
    const { user } = req;

    const attendance = await Attendance.findById(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (attendance.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only check out your own records' });
    }

    const updated = await Attendance.updateCheckOut(
      attendance_id,
      check_out_time,
      check_out_latitude,
      check_out_longitude
    );

    res.json({ message: 'Checked out successfully', attendance: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during check-out' });
  }
});

// Get attendance for user (Worker or their Manager or ADMIN)
router.get('/user/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user } = req;
    const { start_date, end_date, limit } = req.query;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != user_id) {
      return res.status(403).json({ message: 'You can only view your own attendance' });
    }

    if (user.role === 'MANAGER') {
      const worker = await User.findById(user_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers attendance' });
      }
    }

    let attendance;
    if (start_date && end_date) {
      attendance = await Attendance.findByUserInRange(user_id, start_date, end_date);
    } else {
      attendance = await Attendance.findByUser(user_id, limit || 30);
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

// Get today's attendance (Workers)
router.get('/today/my-attendance', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { user } = req;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findByUserAndDate(user.user_id, today);
    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record for today' });
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching today attendance' });
  }
});

// Update attendance status (Manager or ADMIN)
router.patch('/:attendance_id/status', verifyToken, authorize('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { status } = req.body;

    if (!['PRESENT', 'INCOMPLETE', 'LEAVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const attendance = await Attendance.findById(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (req.user.role === 'MANAGER') {
      const worker = await User.findById(attendance.user_id);
      if (worker.manager_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only update your workers attendance' });
      }
    }

    const updated = await Attendance.updateStatus(attendance_id, status);
    res.json({ message: 'Attendance status updated', attendance: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating attendance status' });
  }
});

export default router;
