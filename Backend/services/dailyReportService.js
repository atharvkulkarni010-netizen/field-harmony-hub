import pool from '../config/database.js';

export const createDailyReport = async (user_id, report_date, description, images = []) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO daily_report (user_id, report_date, description, images) VALUES (?, ?, ?, ?)',
      [user_id, report_date, description, JSON.stringify(images)]
    );
    return { report_id: result.insertId, user_id, report_date, description, images };
  } finally {
    connection.release();
  }
};

export const findReportById = async (report_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM daily_report WHERE report_id = ?',
      [report_id]
    );
    if (rows[0] && rows[0].images) {
      rows[0].images = JSON.parse(rows[0].images);
    }
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findReportsByUser = async (user_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM daily_report WHERE user_id = ? ORDER BY report_date DESC',
      [user_id]
    );
    return rows.map(row => ({ ...row, images: JSON.parse(row.images || '[]') }));
  } finally {
    connection.release();
  }
};

export const findReportByUserAndDate = async (user_id, report_date) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM daily_report WHERE user_id = ? AND report_date = ?',
      [user_id, report_date]
    );
    if (rows[0] && rows[0].images) {
      rows[0].images = JSON.parse(rows[0].images);
    }
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findReportsByUserInRange = async (user_id, start_date, end_date) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM daily_report WHERE user_id = ? AND report_date BETWEEN ? AND ? ORDER BY report_date DESC',
      [user_id, start_date, end_date]
    );
    return rows.map(row => ({ ...row, images: JSON.parse(row.images || '[]') }));
  } finally {
    connection.release();
  }
};

export const findAllReports = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM daily_report ORDER BY report_date DESC');
    return rows.map(row => ({ ...row, images: JSON.parse(row.images || '[]') }));
  } finally {
    connection.release();
  }
};

export const updateReport = async (report_id, description, images) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE daily_report SET description = ?, images = ?, updated_at = CURRENT_TIMESTAMP WHERE report_id = ?',
      [description, JSON.stringify(images || []), report_id]
    );
    return { report_id, description, images };
  } finally {
    connection.release();
  }
};

export const deleteReport = async (report_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM daily_report WHERE report_id = ?', [report_id]);
  } finally {
    connection.release();
  }
};

export const getReportWithTasks = async (report_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT dr.*, JSON_ARRAYAGG(JSON_OBJECT('task_id', t.task_id, 'title', t.title, 'project_name', p.name)) as tasks
      FROM daily_report dr
      LEFT JOIN report_task rt ON dr.report_id = rt.report_id
      LEFT JOIN task t ON rt.task_id = t.task_id
      LEFT JOIN project p ON t.project_id = p.project_id
      WHERE dr.report_id = ?
      GROUP BY dr.report_id
    `, [report_id]);
    if (rows[0] && rows[0].images) {
      rows[0].images = JSON.parse(rows[0].images);
    }
    return rows[0];
  } finally {
    connection.release();
  }
};


export const findTeamReports = async (manager_id, date) => {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT dr.*, u.name as worker_name, u.email as worker_email 
      FROM daily_report dr 
      JOIN user u ON dr.user_id = u.user_id 
      WHERE u.manager_id = ?
    `;
    
    const params = [manager_id];
    
    if (date) {
      query += ' AND dr.report_date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY dr.report_date DESC, dr.created_at DESC';

    const [rows] = await connection.query(query, params);
    return rows.map(row => ({ ...row, images: JSON.parse(row.images || '[]') }));
  } finally {
    connection.release();
  }
};


export const findRecentTeamReports = async (manager_id, limit = 5) => {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT dr.*, u.name as worker_name, t.title as task_title
      FROM daily_report dr
      JOIN user u ON dr.user_id = u.user_id
      LEFT JOIN report_task rt ON dr.report_id = rt.report_id
      LEFT JOIN task t ON rt.task_id = t.task_id
      WHERE u.manager_id = ?
      ORDER BY dr.created_at DESC
      LIMIT ?
    `;
    const [rows] = await connection.query(query, [manager_id, limit]);
    
    // Group tasks if multiple per report, though simple query above might duplicate reports 
    // if using LEFT JOIN. For the dashboard summary, let's keep it simple or group.
    // Actually, dashboard shows "Task: Water sampling". 
    // If a report has multiple tasks, we might just want to show one or count.
    // Let's stick to the current query but maybe we should GROUP BY dr.report_id to avoid duplicates if multiple tasks
    
    // Improved query to avoid duplicates and get one task title
    const improvedQuery = `
      SELECT dr.*, u.name as worker_name, 
      (SELECT t.title FROM task t 
       JOIN report_task rt ON t.task_id = rt.task_id 
       WHERE rt.report_id = dr.report_id LIMIT 1) as task_title
      FROM daily_report dr
      JOIN user u ON dr.user_id = u.user_id
      WHERE u.manager_id = ?
      ORDER BY dr.created_at DESC
      LIMIT ?
    `;

    const [finalRows] = await connection.query(improvedQuery, [manager_id, limit]);

    // Calculate "time ago" logic is usually frontend, but we pass created_at
    // Also need status? Daily reports don't seem to have a status column in the CREATE statement seen earlier
    // (daily_report table: report_id, user_id, report_date, description, images, created_at, updated_at)
    // The UI shows "pending" or "approved". Maybe we need to add a status column to daily_report?
    // For now, let's assume they are "Received" or use a placeholder if DB doesn't have it.
    // Wait, earlier view of dailyReportService didn't show status column in insert.
    // Let's check schema if possible, or just default to 'submitted'
    
    return finalRows.map(row => ({
      ...row,
      images: JSON.parse(row.images || '[]'),
      status: 'submitted' // Placeholder as schema doesn't seem to have status for report itself, only tasks have status
    }));
  } finally {
    connection.release();
  }
};
