import pool from '../config/database.js';

class DailyReport {
  static async create(user_id, report_date, description, images = []) {
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
  }

  static async findById(report_id) {
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
  }

  static async findByUser(user_id) {
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
  }

  static async findByUserAndDate(user_id, report_date) {
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
  }

  static async findByUserInRange(user_id, start_date, end_date) {
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
  }

  static async findAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM daily_report ORDER BY report_date DESC');
      return rows.map(row => ({ ...row, images: JSON.parse(row.images || '[]') }));
    } finally {
      connection.release();
    }
  }

  static async update(report_id, description, images) {
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
  }

  static async delete(report_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM daily_report WHERE report_id = ?', [report_id]);
    } finally {
      connection.release();
    }
  }

  static async getReportWithTasks(report_id) {
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
  }
}

export default DailyReport;
