import express from 'express';
import Project from '../models/Project.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create project (ADMIN and MANAGER)
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, description, start_date, end_date, assigned_manager_id } = req.body;
    const { user } = req;

    // Manager can only assign to themselves
    if (user.role === 'MANAGER' && assigned_manager_id != user.user_id) {
      return res.status(403).json({ message: 'Managers can only assign projects to themselves' });
    }

    const project = await Project.create(name, description, start_date, end_date, assigned_manager_id);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Get all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const { user } = req;

    if (user.role === 'ADMIN') {
      const projects = await Project.findAll();
      return res.json(projects);
    }

    if (user.role === 'MANAGER') {
      const projects = await Project.findByManager(user.user_id);
      return res.json(projects);
    }

    // Workers cannot directly view projects, only through task assignments
    res.status(403).json({ message: 'Workers cannot view projects directly' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:project_id', verifyToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only view your own projects' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Update project (Only assigned manager or ADMIN)
router.put('/:project_id', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;
    const updates = req.body;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    const updatedProject = await Project.update(project_id, updates);
    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Update project status (Only assigned manager or ADMIN)
router.patch('/:project_id/status', verifyToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { project_id } = req.params;
    const { status } = req.body;
    const { user } = req;

    if (!['Yet to start', 'Ongoing', 'In Review', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    const updatedProject = await Project.updateStatus(project_id, status);
    res.json({ message: 'Project status updated', project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project status' });
  }
});

// Delete project (ADMIN only)
router.delete('/:project_id', verifyToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { project_id } = req.params;
    await Project.delete(project_id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
