import pool from '../config/database.js';

class ReportTask {
  static async create(report_id, task_id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO report_task (report_id, task_id) VALUES (?, ?)',
        [report_id, task_id]
      );
      return { report_task_id: result.insertId, report_id, task_id };
    } finally {
      connection.release();
    }
  }

  static async findById(report_task_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM report_task WHERE report_task_id = ?',
        [report_task_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByReport(report_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT rt.*, t.title, t.status, p.name as project_name FROM report_task rt JOIN task t ON rt.task_id = t.task_id JOIN project p ON t.project_id = p.project_id WHERE rt.report_id = ?',
        [report_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findByTask(task_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM report_task WHERE task_id = ?',
        [task_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async delete(report_task_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM report_task WHERE report_task_id = ?', [report_task_id]);
    } finally {
      connection.release();
    }
  }

  static async deleteByReport(report_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM report_task WHERE report_id = ?', [report_id]);
    } finally {
      connection.release();
    }
  }
}

export default ReportTask;
