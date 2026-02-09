import * as taskAssignmentService from '../services/taskAssignmentService.js';
import * as taskService from '../services/taskService.js';
import * as projectService from '../services/projectService.js';
import * as userService from '../services/userService.js';

export const assignTask = async (req, res) => {
  try {
    const { task_id, worker_id } = req.body;
    const { user } = req;

    const task = await taskService.findTaskById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await projectService.findProjectById(task.project_id);
    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only assign tasks in your projects' });
    }

    const worker = await userService.findUserById(worker_id);
    if (!worker || worker.role !== 'WORKER') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // If manager, ensure worker is under them
    if (user.role === 'MANAGER' && worker.manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only assign tasks to your workers' });
    }

    const exists = await taskAssignmentService.assignmentExists(task_id, worker_id);
    if (exists) {
      return res.status(400).json({ message: 'Worker is already assigned to this task' });
    }

    const assignment = await taskAssignmentService.createTaskAssignment(task_id, worker_id);
    res.status(201).json({ message: 'Task assigned successfully', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning task' });
  }
};

export const getTaskAssignments = async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await taskService.findTaskById(task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check permissions
    if (req.user.role === 'MANAGER') {
      const project = await projectService.findProjectById(task.project_id);
      if (project.assigned_manager_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only view assignments for your projects' });
      }
    }
    
    // Workers shouldn't see all assignments for a task? 
    // Maybe they need to know team members? Let's check requirement. 
    // Usually strict means NO. Let's block WORKER for now unless specified.
    if (req.user.role === 'WORKER') {
       return res.status(403).json({ message: 'Unauthorized to view task assignments' });
    }

    const assignments = await taskAssignmentService.findAssignmentsByTask(task_id);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const worker_id = req.user.user_id;
    const assignments = await taskAssignmentService.findAssignmentsByWorker(worker_id);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching my assignments' });
  }
};

export const getWorkerAssignments = async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;

    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own assignments' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(worker_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view assignments of your workers' });
      }
    }

    const assignments = await taskAssignmentService.findAssignmentsByWorker(worker_id);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching worker assignments' });
  }
};

export const removeAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { user } = req;

    const assignment = await taskAssignmentService.findAssignmentById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const task = await taskService.findTaskById(assignment.task_id);
    const project = await projectService.findProjectById(task.project_id);

    if (user.role === 'MANAGER' && project.assigned_manager_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only remove assignments from your projects' });
    }

    await taskAssignmentService.deleteAssignment(assignment_id);
    res.json({ message: 'Task assignment removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing assignment' });
  }
};
