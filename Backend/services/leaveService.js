import pool from '../config/database.js';

export const createLeaveRequest = async (user_id, start_date, end_date, reason) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO leave_request (user_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
      [user_id, start_date, end_date, reason]
    );
    return { leave_id: result.insertId, user_id, start_date, end_date, reason };
  } finally {
    connection.release();
  }
};

export const findLeaveById = async (leave_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM leave_request WHERE leave_id = ?',
      [leave_id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findLeavesByUser = async (user_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM leave_request WHERE user_id = ? ORDER BY start_date DESC',
      [user_id]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findLeavesByUserAndStatus = async (user_id, status) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM leave_request WHERE user_id = ? AND status = ? ORDER BY start_date DESC',
      [user_id, status]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findPendingLeaves = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT l.*, u.name, u.email, u.manager_id FROM leave_request l JOIN user u ON l.user_id = u.user_id WHERE l.status = ? ORDER BY l.created_at DESC',
      ['PENDING']
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findPendingLeavesForManager = async (manager_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT l.*, u.name, u.email FROM leave_request l JOIN user u ON l.user_id = u.user_id WHERE u.manager_id = ? AND l.status = ? ORDER BY l.created_at DESC',
      [manager_id, 'PENDING']
    );
    return rows;
  } finally {
    connection.release();
  }
};


export const findTeamLeaves = async (manager_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT l.*, u.name, u.email FROM leave_request l JOIN user u ON l.user_id = u.user_id WHERE u.manager_id = ? ORDER BY l.created_at DESC',
      [manager_id]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const approveLeave = async (leave_id, approved_by) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE leave_request SET status = ?, approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE leave_id = ?',
      ['APPROVED', approved_by, leave_id]
    );
    return { leave_id, status: 'APPROVED', approved_by };
  } finally {
    connection.release();
  }
};

export const rejectLeave = async (leave_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE leave_request SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE leave_id = ?',
      ['REJECTED', leave_id]
    );
    return { leave_id, status: 'REJECTED' };
  } finally {
    connection.release();
  }
};

export const deleteLeave = async (leave_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM leave_request WHERE leave_id = ?', [leave_id]);
  } finally {
    connection.release();
  }
};
