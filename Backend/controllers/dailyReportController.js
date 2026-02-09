import * as dailyReportService from '../services/dailyReportService.js';
import * as reportTaskService from '../services/reportTaskService.js';
import * as userService from '../services/userService.js';
import * as taskService from '../services/taskService.js';

export const createDailyReport = async (req, res) => {
  try {
    const { report_date, description, task_ids } = req.body;
    const { user } = req;

    // Process uploaded files
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Parse task_ids if it comes as a string (FormData array)
    let parsedTaskIds = task_ids;
    if (typeof task_ids === 'string') {
      try {
        parsedTaskIds = JSON.parse(task_ids);
      } catch (e) {
        // Handle case where it might be a single ID string or comma separated
        parsedTaskIds = task_ids.split(',').filter(id => id.trim() !== '');
      }
    }

    const report = await dailyReportService.createDailyReport(user.user_id, report_date, description, imagePaths);

    // Link tasks to report if provided
    if (parsedTaskIds && Array.isArray(parsedTaskIds)) {
      for (const task_id of parsedTaskIds) {
        await reportTaskService.createReportTask(report.report_id, task_id);
      }
    }

    res.status(201).json({ message: 'Daily report submitted', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating daily report' });
  }
};

export const getWorkerReports = async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;
    const { start_date, end_date } = req.query;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(worker_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers reports' });
      }
    }

    let reports;
    if (start_date && end_date) {
      reports = await dailyReportService.findReportsByUserInRange(worker_id, start_date, end_date);
    } else {
      reports = await dailyReportService.findReportsByUser(worker_id);
    }

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const { user } = req;
    const { start_date, end_date } = req.query;

    let reports;
    if (start_date && end_date) {
      reports = await dailyReportService.findReportsByUserInRange(user.user_id, start_date, end_date);
    } else {
      reports = await dailyReportService.findReportsByUser(user.user_id);
    }

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching your reports' });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { report_id } = req.params;
    const report = await dailyReportService.getReportWithTasks(report_id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Permission check
    if (req.user.role === 'WORKER' && report.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own reports' });
    }

    if (req.user.role === 'MANAGER') {
      const worker = await userService.findUserById(report.user_id);
      if (worker.manager_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers reports' });
      }
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

export const updateDailyReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { user } = req;
    const { description, images } = req.body;

    const report = await dailyReportService.findReportById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'WORKER' && report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(report.user_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only update reports of your workers' });
      }
    }

    const updated = await dailyReportService.updateReport(report_id, description, images || []);
    res.json({ message: 'Report updated', report: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating report' });
  }
};

export const addTaskToReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { task_id } = req.body;
    const { user } = req;

    const report = await dailyReportService.findReportById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only add tasks to your own reports' });
    }

    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const reportTask = await reportTaskService.createReportTask(report_id, task_id);
    res.status(201).json({ message: 'Task added to report', reportTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding task to report' });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await dailyReportService.findAllReports();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const deleteDailyReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { user } = req;

    const report = await dailyReportService.findReportById(report_id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role === 'WORKER' && report.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(report.user_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only delete reports of your workers' });
      }
    }

    await reportTaskService.deleteReportTasksByReport(report_id);
    await dailyReportService.deleteReport(report_id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting report' });
  }

};

export const getTeamReports = async (req, res) => {
  try {
    const { user } = req;
    const { date } = req.query;

    if (user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only managers can view team reports' });
    }

    // Date is optional now - if not provided, returns all history
    const reports = await dailyReportService.findTeamReports(user.user_id, date);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team reports' });
  }
};


export const getRecentTeamReports = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only managers can view recent team reports' });
    }

    const reports = await dailyReportService.findRecentTeamReports(user.user_id);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recent team reports' });
  }
};
