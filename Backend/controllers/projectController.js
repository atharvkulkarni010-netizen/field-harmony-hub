import * as projectService from '../services/projectService.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, start_date, end_date, assigned_manager_id } = req.body;
    const { user } = req;

    // Manager can only assign to themselves
    if (user.role === 'MANAGER' && assigned_manager_id != user.user_id) {
      return res.status(403).json({ message: 'Managers can only assign projects to themselves' });
    }

    const project = await projectService.createProject(name, description, start_date, end_date, assigned_manager_id);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { user } = req;

    if (user.role === 'ADMIN') {
      const projects = await projectService.findAllProjects();
      return res.json(projects);
    }

    if (user.role === 'MANAGER') {
      const projects = await projectService.findProjectsByManager(user.user_id);
      return res.json(projects);
    }

    // Workers cannot directly view projects, only through task assignments
    res.status(403).json({ message: 'Workers cannot view projects directly' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;

    const project = await projectService.findProjectById(project_id);
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
};

export const updateProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;
    const updates = req.body;

    const project = await projectService.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    const updatedProject = await projectService.updateProject(project_id, updates);
    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { status } = req.body;
    const { user } = req;

    if (!['Yet to start', 'Ongoing', 'In Review', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await projectService.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update your own projects' });
    }

    const updatedProject = await projectService.updateProjectStatus(project_id, status);
    res.json({ message: 'Project status updated', project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project status' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    await projectService.deleteProject(project_id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};
