import * as managerReportService from '../services/managerReportService.js';
import * as projectService from '../services/projectService.js';

export const createManagerReport = async (req, res) => {
  try {
    const { project_id, summary, outcomes, challenges } = req.body;
    const { user } = req;

    const project = await projectService.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only create reports for your projects' });
    }

    // Check if report already exists for this project
    const existing = await managerReportService.findManagerReportByProject(project_id);
    if (existing) {
      return res.status(400).json({ message: 'Report already exists for this project' });
    }

    const report = await managerReportService.createManagerReport(project_id, user.user_id, summary, outcomes, challenges);
    res.status(201).json({ message: 'Project report submitted', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project report' });
  }
};

export const getProjectReport = async (req, res) => {
  try {
    const { project_id } = req.params;
    const report = await managerReportService.findManagerReportByProject(project_id);

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
};

export const getManagerReports = async (req, res) => {
  try {
    const { manager_id } = req.params;
    const { user } = req;

    if (user.role === 'MANAGER' && user.user_id != manager_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    const reports = await managerReportService.findReportsByManager(manager_id);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const getAllManagerReports = async (req, res) => {
  try {
    const reports = await managerReportService.findAllManagerReports();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const getManagerReportById = async (req, res) => {
  try {
    const { report_id } = req.params;
    const report = await managerReportService.findManagerReportById(report_id);

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
};

export const updateManagerReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { summary, outcomes, challenges } = req.body;
    const { user } = req;

    const report = await managerReportService.findManagerReportById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'MANAGER' && report.manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    const updated = await managerReportService.updateManagerReport(report_id, summary, outcomes, challenges);
    res.json({ message: 'Report updated', report: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating report' });
  }
};

export const deleteManagerReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    await managerReportService.deleteManagerReport(report_id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting report' });
  }
};
