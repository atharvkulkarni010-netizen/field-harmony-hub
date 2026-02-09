import * as taskService from '../services/taskService.js';
import * as projectService from '../services/projectService.js';

export const createTask = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { title, description, start_date, due_date } = req.body;
    const { user } = req;

    const project = await projectService.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only create tasks in your projects' });
    }

    const task = await taskService.createTask(project_id, title, description, start_date, due_date);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user } = req;

    const project = await projectService.findProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only view tasks in your projects' });
    }

    const tasks = await taskService.findTasksByProject(project_id);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Check permissions
    if (user.role === 'MANAGER') {
      const project = await projectService.findProjectById(task.project_id);
      if (project.assigned_manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view tasks in your projects' });
      }
    }

    if (user.role === 'WORKER') {
      // Check if worker is assigned to this task
      const isAssigned = await taskService.isWorkerAssignedToTask(task_id, user.user_id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only view tasks assigned to you' });
      }
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { user } = req;
    const updates = req.body;

    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await projectService.findProjectById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update tasks in your projects' });
    }

    const updatedTask = await taskService.updateTask(task_id, updates);
    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;
    const { user } = req;

    if (!['Yet to start', 'Ongoing', 'In Review', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await projectService.findProjectById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only update tasks in your projects' });
    }

    if (user.role === 'WORKER') {
      const isAssigned = await taskService.isWorkerAssignedToTask(task_id, user.user_id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
      }
    }

    const updatedTask = await taskService.updateTaskStatus(task_id, status);
    res.json({ message: 'Task status updated', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

export const getTaskWorkers = async (req, res) => {
  try {
    const { task_id } = req.params;
    const workers = await taskService.getAssignedWorkers(task_id);
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching assigned workers' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    await taskService.deleteTask(task_id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};


export const getTasksDueToday = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only managers can view tasks due today' });
    }

    const tasks = await taskService.findTasksDueTodayByManager(user.user_id);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks due today' });
  }
};
