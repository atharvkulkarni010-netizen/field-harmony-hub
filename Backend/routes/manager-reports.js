import express from 'express';
import ManagerProjectReport from '../models/ManagerProjectReport.js';
import Project from '../models/Project.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create project report (Project manager)
router.post('/', verifyToken, authorize('MANAGER'), async (req, res) => {
  try {
    const { project_id, summary, outcomes, challenges } = req.body;
    const { user } = req;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only create reports for your projects' });
    }

    // Check if report already exists for this project
    const existing = await ManagerProjectReport.findByProject(project_id);
    if (existing) {
      return res.status(400).json({ message: 'Report already exists for this project' });
    }

    const report = await ManagerProjectReport.create(project_id, user.user_id, summary, outcomes, challenges);
    res.status(201).json({ message: 'Project report submitted', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project report' });
  }
});

// Get report for a project
router.get('/project/:project_id', verifyToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const report = await ManagerProjectReport.findByProject(project_id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found for this project' });
    }

    // Permission check
    if (req.user.role === 'MANAGER' && report.manager_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching project report' });
  }
});

// Get reports for manager
router.get('/manager/:manager_id', verifyToken, async (req, res) => {
  try {
    const { manager_id } = req.params;
    const { user } = req;

    if (user.role === 'MANAGER' && user.user_id != manager_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    const reports = await ManagerProjectReport.findByManager(manager_id);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get all reports (ADMIN only)
router.get('/', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const reports = await ManagerProjectReport.findAll();
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
    const report = await ManagerProjectReport.findById(report_id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Permission check
    if (req.user.role === 'MANAGER' && report.manager_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// Update project report
router.put('/:report_id', verifyToken, authorize('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { report_id } = req.params;
    const { summary, outcomes, challenges } = req.body;
    const { user } = req;

    const report = await ManagerProjectReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'MANAGER' && report.manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    const updated = await ManagerProjectReport.update(report_id, summary, outcomes, challenges);
    res.json({ message: 'Report updated', report: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Delete report (ADMIN only)
router.delete('/:report_id', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { report_id } = req.params;
    await ManagerProjectReport.delete(report_id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

export default router;
