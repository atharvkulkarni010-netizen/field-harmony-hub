import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  createManagerReport, 
  getProjectReport, 
  getManagerReports, 
  getAllManagerReports, 
  getManagerReportById, 
  updateManagerReport, 
  deleteManagerReport 
} from '../controllers/managerReportController.js';

const router = express.Router();

// Create project report (Project manager)
router.post('/', verifyToken, authorize('MANAGER'), createManagerReport);

// Get report for a project
router.get('/project/:project_id', verifyToken, getProjectReport);

// Get reports for manager
router.get('/manager/:manager_id', verifyToken, getManagerReports);

// Get all reports (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), getAllManagerReports);

// Get report by ID
router.get('/:report_id', verifyToken, getManagerReportById);

// Update project report
router.put('/:report_id', verifyToken, authorize('MANAGER', 'ADMIN'), updateManagerReport);

// Delete report (ADMIN only)
router.delete('/:report_id', verifyToken, authorize('ADMIN'), deleteManagerReport);

export default router;
