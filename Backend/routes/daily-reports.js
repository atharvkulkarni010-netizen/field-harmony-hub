import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.js';
import { 
  createDailyReport, 
  getWorkerReports, 
  getMyReports,
  getReportById, 
  updateDailyReport, 
  addTaskToReport, 
  getAllReports, 
  deleteDailyReport,
  getTeamReports,
  getRecentTeamReports
} from '../controllers/dailyReportController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get Team Reports (Manager)
router.get('/manager/team-reports', verifyToken, authorize('MANAGER'), getTeamReports);

// Get Recent Team Reports (Manager) - for Dashboard
router.get('/manager/recent-reports', verifyToken, authorize('MANAGER'), getRecentTeamReports);

// Create daily report (Workers)
router.post('/', verifyToken, authorize('WORKER'), upload.array('images', 5), createDailyReport);

// Get reports for current worker
router.get('/worker/me', verifyToken, authorize('WORKER'), getMyReports);

// Get reports for worker (Worker, their Manager, or ADMIN)
router.get('/worker/:worker_id', verifyToken, getWorkerReports);

// Get report by ID
router.get('/:report_id', verifyToken, getReportById);

// Update daily report (Worker or ADMIN)
router.put('/:report_id', verifyToken, updateDailyReport);

// Add task to report
router.post('/:report_id/tasks', verifyToken, authorize('WORKER'), addTaskToReport);

// Get all reports (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), getAllReports);

// Delete report (Worker or ADMIN)
router.delete('/:report_id', verifyToken, deleteDailyReport);

export default router;
