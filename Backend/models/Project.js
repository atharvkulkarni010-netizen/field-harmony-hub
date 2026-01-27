import pool from '../config/database.js';

class Project {
  static async create(name, description, start_date, end_date, assigned_manager_id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO project (name, description, start_date, end_date, assigned_manager_id) VALUES (?, ?, ?, ?, ?)',
        [name, description, start_date, end_date, assigned_manager_id]
      );
      return { project_id: result.insertId, name, description, start_date, end_date, assigned_manager_id };
    } finally {
      connection.release();
    }
  }

  static async findById(project_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM project WHERE project_id = ?',
        [project_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM project');
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findByManager(manager_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM project WHERE assigned_manager_id = ?',
        [manager_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async update(project_id, updates) {
    const { name, description, start_date, end_date, status } = updates;
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'UPDATE project SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?',
        [name, description, start_date, end_date, status, project_id]
      );
      return { project_id, name, description, start_date, end_date, status };
    } finally {
      connection.release();
    }
  }

  static async updateStatus(project_id, status) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'UPDATE project SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?',
        [status, project_id]
      );
      return { project_id, status };
    } finally {
      connection.release();
    }
  }

  static async delete(project_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM project WHERE project_id = ?', [project_id]);
    } finally {
      connection.release();
    }
  }
}

export default Project;
