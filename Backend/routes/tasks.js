import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  createTask, 
  getProjectTasks, 
  getTaskById, 
  updateTask, 
  updateTaskStatus, 
  getTaskWorkers, 
  deleteTask,
  getTasksDueToday
} from '../controllers/taskController.js';

const router = express.Router();

// Create task in a project (Manager of the project or ADMIN)
router.post('/project/:project_id', verifyToken, authorize('ADMIN', 'MANAGER'), createTask);

// Get tasks due today (Manager only)
router.get('/due-today', verifyToken, authorize('MANAGER'), getTasksDueToday);

// Get all tasks in a project
router.get('/project/:project_id', verifyToken, getProjectTasks);

// Get task by ID
router.get('/:task_id', verifyToken, getTaskById);

// Update task (Only project manager or ADMIN)
router.put('/:task_id', verifyToken, authorize('ADMIN', 'MANAGER'), updateTask);

// Update task status (Only project manager or ADMIN)
router.patch('/:task_id/status', verifyToken, authorize('ADMIN', 'MANAGER'), updateTaskStatus);

// Get workers assigned to a task
router.get('/:task_id/workers', verifyToken, getTaskWorkers);

// Delete task (ADMIN only)
router.delete('/:task_id', verifyToken, authorize('ADMIN'), deleteTask);

export default router;
