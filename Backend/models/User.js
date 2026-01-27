import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

// User Model
class User {
  static async create(name, email, password, role, manager_id = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO user (name, email, password, role, manager_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, manager_id]
      );
      return { user_id: result.insertId, name, email, role, manager_id };
    } finally {
      connection.release();
    }
  }

  static async findById(user_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT user_id, name, email, role, manager_id, created_at FROM user WHERE user_id = ?',
        [user_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM user WHERE email = ?',
        [email]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findAll(role = null) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT user_id, name, email, role, manager_id, created_at FROM user';
      const params = [];
      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }
      const [rows] = await connection.query(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findByManager(manager_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT user_id, name, email, role, manager_id, created_at FROM user WHERE manager_id = ?',
        [manager_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async update(user_id, updates) {
    const { name, email, role, manager_id } = updates;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE user SET name = ?, email = ?, role = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [name, email, role, manager_id, user_id]
      );
      return { user_id, name, email, role, manager_id };
    } finally {
      connection.release();
    }
  }

  static async delete(user_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM user WHERE user_id = ?', [user_id]);
    } finally {
      connection.release();
    }
  }
}

export default User;
