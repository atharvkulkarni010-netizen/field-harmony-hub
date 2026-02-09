import * as leaveService from '../services/leaveService.js';
import * as userService from '../services/userService.js';

export const applyForLeave = async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const { user } = req;

    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Start date, end date, and reason are required' });
    }

    const leave = await leaveService.createLeaveRequest(user.user_id, start_date, end_date, reason);
    res.status(201).json({ message: 'Leave application submitted', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error applying for leave' });
  }
};

export const getWorkerLeaves = async (req, res) => {
  try {
    const { worker_id } = req.params;
    const { user } = req;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != worker_id) {
      return res.status(403).json({ message: 'You can only view your own leave requests' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(worker_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers leave requests' });
      }
    }

    const leaves = await leaveService.findLeavesByUser(worker_id);
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const { user } = req;

    let leaves;
    if (user.role === 'ADMIN') {
      leaves = await leaveService.findPendingLeaves();
    } else {
      leaves = await leaveService.findPendingLeavesForManager(user.user_id);
    }

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending leave requests' });
  }
};

export const getTeamLeaves = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only managers can view team leaves' });
    }

    const leaves = await leaveService.findTeamLeaves(user.user_id);
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team leaves' });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { user } = req;

    const leave = await leaveService.findLeaveById(leave_id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(leave.user_id);
      if (worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only approve your workers leave requests' });
      }
    }

    const approved = await leaveService.approveLeave(leave_id, user.user_id);
    res.json({ message: 'Leave approved', leave: approved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving leave' });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { user } = req;

    const leave = await leaveService.findLeaveById(leave_id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(leave.user_id);
      if (worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only reject your workers leave requests' });
      }
    }

    const rejected = await leaveService.rejectLeave(leave_id);
    res.json({ message: 'Leave rejected', leave: rejected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rejecting leave' });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const leave = await leaveService.findLeaveById(leave_id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Permission check
    if (req.user.role === 'WORKER' && leave.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only view your own leave requests' });
    }

    res.json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching leave request' });
  }
};
