import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  updateProject, 
  updateProjectStatus, 
  deleteProject 
} from '../controllers/projectController.js';

const router = express.Router();

// Create project (ADMIN and MANAGER)
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), createProject);

// Get all projects
router.get('/', verifyToken, getAllProjects);

// Get project by ID
router.get('/:project_id', verifyToken, getProjectById);

// Update project (Only assigned manager or ADMIN)
router.put('/:project_id', verifyToken, authorize('ADMIN', 'MANAGER'), updateProject);

// Update project status (Only assigned manager or ADMIN)
router.patch('/:project_id/status', verifyToken, authorize('ADMIN', 'MANAGER'), updateProjectStatus);

// Delete project (ADMIN only)
router.delete('/:project_id', verifyToken, authorize('ADMIN'), deleteProject);

export default router;
