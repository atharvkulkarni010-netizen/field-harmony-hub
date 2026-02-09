import * as attendanceService from '../services/attendanceService.js';
import * as userService from '../services/userService.js';

export const checkIn = async (req, res) => {
  try {
    const { date, check_in_time, check_in_latitude, check_in_longitude } = req.body;
    const { user } = req;

    const existing = await attendanceService.findAttendanceByUserAndDate(user.user_id, date);
    if (existing) {
      return res.status(400).json({ message: 'Already checked in for this date' });
    }

    const attendance = await attendanceService.createAttendance(
      user.user_id,
      date,
      check_in_time,
      check_in_latitude,
      check_in_longitude,
      'PRESENT'
    );

    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during check-in' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { check_out_time, check_out_latitude, check_out_longitude } = req.body;
    const { user } = req;

    const attendance = await attendanceService.findAttendanceById(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (attendance.user_id !== user.user_id) {
      return res.status(403).json({ message: 'You can only check out your own records' });
    }

    const updated = await attendanceService.updateCheckOut(
      attendance_id,
      check_out_time,
      check_out_latitude,
      check_out_longitude
    );

    res.json({ message: 'Checked out successfully', attendance: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during check-out' });
  }
};

export const getUserAttendance = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user } = req;
    const { start_date, end_date, limit } = req.query;

    // Permission check
    if (user.role === 'WORKER' && user.user_id != user_id) {
      return res.status(403).json({ message: 'You can only view your own attendance' });
    }

    if (user.role === 'MANAGER') {
      const worker = await userService.findUserById(user_id);
      if (!worker || worker.manager_id !== user.user_id) {
        return res.status(403).json({ message: 'You can only view your workers attendance' });
      }
    }

    let attendance;
    if (start_date && end_date) {
      attendance = await attendanceService.findAttendanceByUserInRange(user_id, start_date, end_date);
    } else {
      attendance = await attendanceService.findAttendanceByUser(user_id, limit || 30);
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const { user } = req;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await attendanceService.findAttendanceByUserAndDate(user.user_id, today);
    // Return null if not checked in instead of 404 to avoid console errors
    if (!attendance) {
      return res.json(null); 
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching today attendance' });
  }
};

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { status } = req.body;

    if (!['PRESENT', 'INCOMPLETE', 'LEAVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const attendance = await attendanceService.findAttendanceById(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (req.user.role === 'MANAGER') {
      const worker = await userService.findUserById(attendance.user_id);
      if (worker.manager_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only update your workers attendance' });
      }
    }

    const updated = await attendanceService.updateAttendanceStatus(attendance_id, status);
    res.json({ message: 'Attendance status updated', attendance: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating attendance status' });
  }
};

export const getTeamAttendance = async (req, res) => {
  try {
    const { user } = req;
    const { date } = req.query;

    if (user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only managers can view team attendance' });
    }

    const queryDate = date || new Date().toISOString().split('T')[0];
    const attendance = await attendanceService.findTeamAttendance(user.user_id, queryDate);
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team attendance' });
  }
};
