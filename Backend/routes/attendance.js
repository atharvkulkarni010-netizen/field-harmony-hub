import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  checkIn, 
  checkOut, 
  getUserAttendance, 
  getTodayAttendance, 
  updateAttendanceStatus,
  getTeamAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

// Get Team Attendance (Manager)
router.get('/manager/team-attendance', verifyToken, authorize('MANAGER'), getTeamAttendance);

// Check in (Workers)
router.post('/check-in', verifyToken, authorize('WORKER'), checkIn);

// Check out (Workers)
router.patch('/:attendance_id/check-out', verifyToken, authorize('WORKER'), checkOut);

// Get attendance for user (Worker or their Manager or ADMIN)
router.get('/user/:user_id', verifyToken, getUserAttendance);

// Get today's attendance (Workers)
router.get('/today/my-attendance', verifyToken, authorize('WORKER'), getTodayAttendance);

// Update attendance status (Manager or ADMIN)
router.patch('/:attendance_id/status', verifyToken, authorize('MANAGER', 'ADMIN'), updateAttendanceStatus);

export default router;
