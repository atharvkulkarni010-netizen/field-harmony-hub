import express from 'express';
import TaskAssignment from '../models/TaskAssignment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Assign task to worker (Project manager or ADMIN)
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { task_id, worker_id } = req.body;
    const { user } = req;

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only assign tasks in your projects' });
    }

    const worker = await User.findById(worker_id);
    if (!worker || worker.role !== 'WORKER') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // If manager, ensure worker is under them
    if (user.role === 'MANAGER' && worker.manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only assign tasks to your workers' });
    }

    const exists = await TaskAssignment.exists(task_id, worker_id);
    if (exists) {
      return res.status(400).json({ message: 'Worker is already assigned to this task' });
    }

    const assignment = await TaskAssignment.create(task_id, worker_id);
    res.status(201).json({ message: 'Task assigned successfully', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning task' });
  }
});

// Get assignments for a task
router.get('/task/:task_id', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const assignments = await TaskAssignment.findByTask(task_id);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Get assignments for a worker (Worker or ADMIN)
router.get('/worker/:worker_id', verifyToken, async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;

    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own assignments' });
    }

    const assignments = await TaskAssignment.findByWorker(worker_id);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching worker assignments' });
  }
});

// Remove task assignment (Project manager or ADMIN)
router.delete('/:assignment_id', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { user } = req;

    const assignment = await TaskAssignment.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const task = await Task.findById(assignment.task_id);
    const project = await Project.findById(task.project_id);

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only remove assignments from your projects' });
    }

    await TaskAssignment.delete(assignment_id);
    res.json({ message: 'Task assignment removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing assignment' });
  }
});

export default router;
