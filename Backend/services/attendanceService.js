import pool from '../config/database.js';

export const createAttendance = async (user_id, date, check_in_time, check_in_latitude, check_in_longitude, status = 'PRESENT') => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO attendance (user_id, date, check_in_time, check_in_latitude, check_in_longitude, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, date, check_in_time, check_in_latitude, check_in_longitude, status]
    );
    return { attendance_id: result.insertId, user_id, date, check_in_time, check_in_latitude, check_in_longitude, status };
  } finally {
    connection.release();
  }
};

export const findAttendanceById = async (attendance_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM attendance WHERE attendance_id = ?',
      [attendance_id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findAttendanceByUserAndDate = async (user_id, date) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [user_id, date]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findAttendanceByUserInRange = async (user_id, start_date, end_date) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [user_id, start_date, end_date]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findAttendanceByUser = async (user_id, limit = 30) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      [user_id, limit]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const updateCheckOut = async (attendance_id, check_out_time, check_out_latitude, check_out_longitude) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE attendance SET check_out_time = ?, check_out_latitude = ?, check_out_longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE attendance_id = ?',
      [check_out_time, check_out_latitude, check_out_longitude, attendance_id]
    );
    return { attendance_id, check_out_time, check_out_latitude, check_out_longitude };
  } finally {
    connection.release();
  }
};

export const updateAttendanceStatus = async (attendance_id, status) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE attendance SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE attendance_id = ?',
      [status, attendance_id]
    );
    return { attendance_id, status };
  } finally {
    connection.release();
  }
};

export const deleteAttendance = async (attendance_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM attendance WHERE attendance_id = ?', [attendance_id]);
  } finally {
    connection.release();
  }
};
export const findTeamAttendance = async (manager_id, date) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        u.user_id, 
        u.name, 
        u.email,
        a.attendance_id,
        a.check_in_time,
        a.check_out_time,
        a.status,
        a.check_in_latitude,
        a.check_in_longitude
       FROM user u
       LEFT JOIN attendance a ON u.user_id = a.user_id AND a.date = ?
       WHERE u.manager_id = ? AND u.role = 'WORKER'
       ORDER BY u.name ASC`,
      [date, manager_id]
    );
    return rows;
  } finally {
    connection.release();
  }
};
