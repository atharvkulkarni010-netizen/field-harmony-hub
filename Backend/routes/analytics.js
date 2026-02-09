import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes should be protected
// All analytics routes should be protected and restricted to Admin/Manager
router.use(verifyToken, authorize('ADMIN', 'MANAGER'));

router.get('/stats', analyticsController.getDashboardStats);
router.get('/attendance', analyticsController.getAttendanceTrends);
router.get('/projects', analyticsController.getProjectStatus);
router.get('/activity', analyticsController.getRecentActivity);
router.get('/tasks-by-project', analyticsController.getTasksByProject);
router.get('/monthly-attendance', analyticsController.getMonthlyAttendance);
router.get('/manager-stats', analyticsController.getManagerStats);
router.get('/key-metrics', analyticsController.getKeyMetrics);
router.get('/weekly-progress', analyticsController.getWeeklyProgress);

export default router;
