import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create task in a project (Manager of the project or ADMIN)
router.post('/project/:project_id', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { project_id } = req.params;
    const { title, description, start_date, due_date } = req.body;
    const { user } = req;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only create tasks in your projects' });
    }

    const task = await Task.create(project_id, title, description, start_date, due_date);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Get all tasks in a project
router.get('/project/:project_id', verifyToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only view tasks in your projects' });
    }

    const tasks = await Task.findByProject(project_id);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get task by ID
router.get('/:task_id', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Update task (Only project manager or ADMIN)
router.put('/:task_id', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { task_id } = req.params;
    const { user } = req;
    const updates = req.body;

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update tasks in your projects' });
    }

    const updatedTask = await Task.update(task_id, updates);
    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Update task status (Only project manager or ADMIN)
router.patch('/:task_id/status', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;
    const { user } = req;

    if (!['Yet to start', 'Ongoing', 'In Review', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update tasks in your projects' });
    }

    const updatedTask = await Task.updateStatus(task_id, status);
    res.json({ message: 'Task status updated', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task status' });
  }
});

// Get workers assigned to a task
router.get('/:task_id/workers', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const workers = await Task.getAssignedWorkers(task_id);
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching assigned workers' });
  }
});

// Delete task (ADMIN only)
router.delete('/:task_id', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { task_id } = req.params;
    await Task.delete(task_id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

export default router;
