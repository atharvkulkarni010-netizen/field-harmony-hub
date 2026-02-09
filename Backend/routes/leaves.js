import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  applyForLeave, 
  getWorkerLeaves, 
  getPendingLeaves, 
  approveLeave, 
  rejectLeave, 
  getLeaveById,
  getTeamLeaves
} from '../controllers/leaveController.js';

const router = express.Router();

// Get Team Leaves (Manager)
router.get('/manager/team-leaves', verifyToken, authorize('MANAGER'), getTeamLeaves);

// Apply for leave (Workers)
router.post('/', verifyToken, authorize('WORKER'), applyForLeave);

// Get leave requests for worker
router.get('/worker/:worker_id', verifyToken, getWorkerLeaves);

// Get pending leave requests
router.get('/pending/all', verifyToken, authorize('ADMIN', 'MANAGER'), getPendingLeaves);

// Approve leave (Manager or ADMIN)
router.patch('/:leave_id/approve', verifyToken, authorize('ADMIN', 'MANAGER'), approveLeave);

// Reject leave (Manager or ADMIN)
router.patch('/:leave_id/reject', verifyToken, authorize('ADMIN', 'MANAGER'), rejectLeave);

// Get leave by ID
router.get('/:leave_id', verifyToken, getLeaveById);

export default router;
