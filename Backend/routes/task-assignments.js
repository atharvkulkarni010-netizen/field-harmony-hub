import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  assignTask, 
  getTaskAssignments, 
  getWorkerAssignments, 
  getMyAssignments,
  removeAssignment 
} from '../controllers/taskAssignmentController.js';

const router = express.Router();

// Assign task to worker (Project manager or ADMIN)
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), assignTask);

// Get my assignments (Worker)
router.get('/my-assignments', verifyToken, authorize('WORKER'), getMyAssignments);

// Get assignments for a task
router.get('/task/:task_id', verifyToken, getTaskAssignments);

// Get assignments for a worker (Worker or ADMIN)
router.get('/worker/:worker_id', verifyToken, getWorkerAssignments);

// Remove task assignment (Project manager or ADMIN)
router.delete('/:assignment_id', verifyToken, authorize('ADMIN', 'MANAGER'), removeAssignment);

export default router;
