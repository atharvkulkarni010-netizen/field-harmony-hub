import pool from '../config/database.js';

class TaskAssignment {
  static async create(task_id, worker_id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO task_assignment (task_id, worker_id) VALUES (?, ?)',
        [task_id, worker_id]
      );
      return { assignment_id: result.insertId, task_id, worker_id };
    } finally {
      connection.release();
    }
  }

  static async findById(assignment_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM task_assignment WHERE assignment_id = ?',
        [assignment_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByTask(task_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM task_assignment WHERE task_id = ?',
        [task_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findByWorker(worker_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT ta.assignment_id, ta.task_id, t.title, t.status, p.name as project_name, p.project_id FROM task_assignment ta JOIN task t ON ta.task_id = t.task_id JOIN project p ON t.project_id = p.project_id WHERE ta.worker_id = ? ORDER BY t.due_date',
        [worker_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async delete(assignment_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM task_assignment WHERE assignment_id = ?', [assignment_id]);
    } finally {
      connection.release();
    }
  }

  static async deleteByTaskAndWorker(task_id, worker_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'DELETE FROM task_assignment WHERE task_id = ? AND worker_id = ?',
        [task_id, worker_id]
      );
    } finally {
      connection.release();
    }
  }

  static async exists(task_id, worker_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT 1 FROM task_assignment WHERE task_id = ? AND worker_id = ?',
        [task_id, worker_id]
      );
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }
}

export default TaskAssignment;
