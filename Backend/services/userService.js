import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import * as skillService from './skillService.js';

export const createUserWithVerification = async (name, email, password, role, verificationToken, manager_id = null, skills = []) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO user (name, email, password, role, manager_id, verification_token, is_verified, force_password_reset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, manager_id, verificationToken, false, true]
    );
    const user_id = result.insertId;

    if (skills && skills.length > 0) {
      await skillService.processUserSkills(user_id, skills);
    }

    return { user_id, name, email, role, manager_id, skills };
  } finally {
    connection.release();
  }
};

export const findUserByVerificationToken = async (token) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM user WHERE verification_token = ?',
      [token]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export const verifyUser = async (user_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE user SET is_verified = TRUE, verification_token = NULL WHERE user_id = ?',
      [user_id]
    );
  } finally {
    connection.release();
  }
};

export const createUser = async (name, email, password, role, manager_id = null) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO user (name, email, password, role, manager_id, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, manager_id, true]
    );
    return { user_id: result.insertId, name, email, role, manager_id };
  } finally {
    connection.release();
  }
};

export const findUserById = async (user_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        u.user_id, u.name, u.email, u.role, u.manager_id, u.created_at,
        (SELECT GROUP_CONCAT(s.name)
         FROM user_skill us
         JOIN skill s ON us.skill_id = s.skill_id
         WHERE us.user_id = u.user_id) as skills
       FROM user u WHERE u.user_id = ?`,
      [user_id]
    );
    if (rows[0] && rows[0].skills) {
      rows[0].skills = rows[0].skills.split(',');
    } else if (rows[0]) {
      rows[0].skills = [];
    }
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findUserByEmail = async (email) => {
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
};

export const findAllUsers = async (role = null) => {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        u.user_id, u.name, u.email, u.role, u.manager_id, u.created_at,
        (SELECT COUNT(*) 
         FROM task_assignment ta 
         JOIN task t ON ta.task_id = t.task_id 
         WHERE ta.worker_id = u.user_id 
         AND t.status != 'Completed') as active_tasks,
        (SELECT status 
         FROM attendance a 
         WHERE a.user_id = u.user_id 
         AND a.date = CURDATE()) as today_status,
        (SELECT GROUP_CONCAT(s.name)
         FROM user_skill us
         JOIN skill s ON us.skill_id = s.skill_id
         WHERE us.user_id = u.user_id) as skills
      FROM user u
    `;
    const params = [];
    if (role) {
      query += ' WHERE u.role = ?';
      params.push(role);
    }
    const [rows] = await connection.query(query, params);
    return rows.map(user => ({
      ...user,
      skills: user.skills ? user.skills.split(',') : []
    }));
  } finally {
    connection.release();
  }
};

export const findUsersByManager = async (manager_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        u.user_id, u.name, u.email, u.role, u.manager_id, u.created_at,
        (SELECT COUNT(*) 
         FROM task_assignment ta 
         JOIN task t ON ta.task_id = t.task_id 
         WHERE ta.worker_id = u.user_id 
         AND t.status != 'Completed') as active_tasks,
        (SELECT status 
         FROM attendance a 
         WHERE a.user_id = u.user_id 
         AND a.date = CURDATE()) as today_status,
        (SELECT GROUP_CONCAT(s.name)
         FROM user_skill us
         JOIN skill s ON us.skill_id = s.skill_id
         WHERE us.user_id = u.user_id) as skills
       FROM user u 
       WHERE u.manager_id = ?`,
      [manager_id]
    );
    return rows.map(user => ({
      ...user,
      skills: user.skills ? user.skills.split(',') : []
    }));
  } finally {
    connection.release();
  }
};

export const updateUser = async (user_id, updates) => {
  const { name, email, role, manager_id, skills } = updates;
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE user SET name = ?, email = ?, role = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [name, email, role, manager_id, user_id]
    );

    if (skills) {
      await skillService.updateUserSkills(user_id, skills);
    }

    return { user_id, name, email, role, manager_id, skills };
  } finally {
    connection.release();
  }
};

export const deleteUser = async (user_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM user WHERE user_id = ?', [user_id]);
  } finally {
    connection.release();
  }
};

export const updateUserPassword = async (user_id, hashedPassword) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE user SET password = ?, force_password_reset = 0 WHERE user_id = ?',
      [hashedPassword, user_id]
    );
  } finally {
    connection.release();
  }
};
