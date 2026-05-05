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

    // Validate that the task dates fall within the project's timeline
    const projStart = new Date(project.start_date);
    const projEnd = new Date(project.end_date);
    const tStart = new Date(start_date);
    const tEnd = new Date(due_date);

    projStart.setHours(0, 0, 0, 0);
    projEnd.setHours(23, 59, 59, 999);
    tStart.setHours(0, 0, 0, 0);
    tEnd.setHours(0, 0, 0, 0);

    if (tStart < projStart || tEnd > projEnd) {
      return res.status(400).json({ 
        message: `Task timeline must fall within the project's timeline (Project Start: ${projStart.toISOString().split('T')[0]}, Project End: ${projEnd.toISOString().split('T')[0]})` 
      });
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
    const { user } = req;
    
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

    // Validate timeline constraints
    const finalStartDate = updates.start_date || task.start_date;
    const finalDueDate = updates.due_date || task.due_date;

    const projStart = new Date(project.start_date);
    const projEnd = new Date(project.end_date);
    const tStart = new Date(finalStartDate);
    const tEnd = new Date(finalDueDate);

    projStart.setHours(0, 0, 0, 0);
    projEnd.setHours(23, 59, 59, 999);
    tStart.setHours(0, 0, 0, 0);
    tEnd.setHours(0, 0, 0, 0);

    if (tStart < projStart || tEnd > projEnd) {
      return res.status(400).json({ 
        message: `Task timeline must fall within the project's timeline (Project Start: ${projStart.toISOString().split('T')[0]}, Project End: ${projEnd.toISOString().split('T')[0]})` 
      });
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

    if (user.role === 'MANAGER') {
      const project = await projectService.findProjectById(task.project_id);
      if (project.assigned_manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only update tasks in your projects' });
      }
    }

    if (user.role === 'WORKER') {
      const isAssigned = await taskService.isWorkerAssignedToTask(task_id, user.user_id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
      }

      // Timeline restriction for workers
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tStart = new Date(task.start_date);
      const tEnd = new Date(task.due_date);
      tStart.setHours(0, 0, 0, 0);
      tEnd.setHours(23, 59, 59, 999);

      if (today < tStart || today > tEnd) {
        return res.status(400).json({
          message: `You can only work on this task within its designated timeline (Task Start: ${tStart.toISOString().split('T')[0]}, Task End: ${tEnd.toISOString().split('T')[0]}).`
        });
      }
    }

    const updatedTask = await taskService.updateTaskStatus(task_id, status);
    res.json({ message: 'Task status updated', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { user } = req;

    const task = await taskService.findTaskById(task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Verify worker assignment
    const isAssigned = await taskService.isWorkerAssignedToTask(task_id, user.user_id);
    if (!isAssigned && user.role === 'WORKER') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (user.role === 'WORKER') {
      // Timeline restriction for workers
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tStart = new Date(task.start_date);
      const tEnd = new Date(task.due_date);
      tStart.setHours(0, 0, 0, 0);
      tEnd.setHours(23, 59, 59, 999);

      if (today < tStart || today > tEnd) {
        return res.status(400).json({
          message: `You can only submit this task within its designated timeline (Task Start: ${tStart.toISOString().split('T')[0]}, Task End: ${tEnd.toISOString().split('T')[0]}).`
        });
      }
    }

    const updated = await taskService.updateTaskStatus(task_id, 'In Review');
    res.json({ message: 'Task submitted for review', task: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting task' });
  }
};

export const approveTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    // user is Manager, verified by middleware

    const task = await taskService.findTaskById(task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Clear rejection reason and set to Completed
    const updated = await taskService.updateTaskRejection(task_id, null, 'Completed');
    res.json({ message: 'Task approved', task: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving task' });
  }
};

export const rejectTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const task = await taskService.findTaskById(task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updated = await taskService.updateTaskRejection(task_id, reason, 'Ongoing');
    res.json({ message: 'Task rejected', task: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rejecting task' });
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
    const { user } = req;

    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (user.role === 'MANAGER') {
      const project = await projectService.findProjectById(task.project_id);
      if (!project || project.assigned_manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only delete tasks in your projects' });
      }
    }

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
