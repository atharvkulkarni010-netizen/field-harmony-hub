import express from 'express';
import DailyReport from '../models/DailyReport.js';
import ReportTask from '../models/ReportTask.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create daily report (Workers)
router.post('/', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { report_date, description, images, task_ids } = req.body;
    const { user } = req;

    const report = await DailyReport.create(user.user_id, report_date, description, images || []);

    // Link tasks to report if provided
    if (task_ids && Array.isArray(task_ids)) {
      for (const task_id of task_ids) {
        await ReportTask.create(report.report_id, task_id);
      }
    }

    res.status(201).json({ message: 'Daily report submitted', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating daily report' });
  }
});

// Get reports for worker (Worker, their Manager, or ADMIN)
router.get('/worker/:worker_id', verifyToken, async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;
    const { start_date, end_date } = req.query;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    if (user.role === 'MANAGER') {
      const worker = await User.findById(worker_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers reports' });
      }
    }

    let reports;
    if (start_date && end_date) {
      reports = await DailyReport.findByUserInRange(worker_id, start_date, end_date);
    } else {
      reports = await DailyReport.findByUser(worker_id);
    }

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get report by ID
router.get('/:report_id', verifyToken, async (req, res) => {
  try {
    const { report_id } = req.params;
    const report = await DailyReport.getReportWithTasks(report_id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Permission check
    if (req.user.role === 'WORKER' && report.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    if (req.user.role === 'MANAGER') {
      const worker = await User.findById(report.user_id);
      if (worker.manager_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers reports' });
      }
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// Update daily report (Worker or ADMIN)
router.put('/:report_id', verifyToken, async (req, res) => {
  try {
    const { report_id } = req.params;
    const { user } = req;
    const { description, images } = req.body;

    const report = await DailyReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'WORKER' && report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    const updated = await DailyReport.update(report_id, description, images || []);
    res.json({ message: 'Report updated', report: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Add task to report
router.post('/:report_id/tasks', verifyToken, authorize('WORKER'), async (req, res) => {
  try {
    const { report_id } = req.params;
    const { task_id } = req.body;
    const { user } = req;

    const report = await DailyReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only add tasks to your own reports' });
    }

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const reportTask = await ReportTask.create(report_id, task_id);
    res.status(201).json({ message: 'Task added to report', reportTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding task to report' });
  }
});

// Get all reports (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const reports = await DailyReport.findAll();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Delete report (Worker or ADMIN)
router.delete('/:report_id', verifyToken, async (req, res) => {
  try {
    const { report_id } = req.params;
    const { user } = req;

    const report = await DailyReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'WORKER' && report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    await ReportTask.deleteByReport(report_id);
    await DailyReport.delete(report_id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

export default router;
