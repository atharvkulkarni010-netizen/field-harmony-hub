import pool from '../config/database.js';

class ManagerProjectReport {
  static async create(project_id, manager_id, summary, outcomes, challenges) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO manager_project_report (project_id, manager_id, summary, outcomes, challenges) VALUES (?, ?, ?, ?, ?)',
        [project_id, manager_id, summary, outcomes, challenges]
      );
      return { manager_report_id: result.insertId, project_id, manager_id, summary, outcomes, challenges };
    } finally {
      connection.release();
    }
  }

  static async findById(manager_report_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM manager_project_report WHERE manager_report_id = ?',
        [manager_report_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByProject(project_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM manager_project_report WHERE project_id = ?',
        [project_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByManager(manager_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT mpr.*, p.name as project_name FROM manager_project_report mpr JOIN project p ON mpr.project_id = p.project_id WHERE mpr.manager_id = ? ORDER BY mpr.submitted_at DESC',
        [manager_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT mpr.*, p.name as project_name, u.name as manager_name FROM manager_project_report mpr JOIN project p ON mpr.project_id = p.project_id JOIN user u ON mpr.manager_id = u.user_id ORDER BY mpr.submitted_at DESC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async update(manager_report_id, summary, outcomes, challenges) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'UPDATE manager_project_report SET summary = ?, outcomes = ?, challenges = ? WHERE manager_report_id = ?',
        [summary, outcomes, challenges, manager_report_id]
      );
      return { manager_report_id, summary, outcomes, challenges };
    } finally {
      connection.release();
    }
  }

  static async delete(manager_report_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM manager_project_report WHERE manager_report_id = ?', [manager_report_id]);
    } finally {
      connection.release();
    }
  }
}

export default ManagerProjectReport;
