import pool from '../config/database.js';

export const createTask = async (project_id, title, description, start_date, due_date) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO task (project_id, title, description, start_date, due_date) VALUES (?, ?, ?, ?, ?)',
      [project_id, title, description, start_date, due_date]
    );
    return { task_id: result.insertId, project_id, title, description, start_date, due_date };
  } finally {
    connection.release();
  }
};

export const findTaskById = async (task_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM task WHERE task_id = ?',
      [task_id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export const findTasksByProject = async (project_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM task WHERE project_id = ? ORDER BY created_at DESC',
      [project_id]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findAllTasks = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM task ORDER BY created_at DESC');
    return rows;
  } finally {
    connection.release();
  }
};

export const updateTask = async (task_id, updates) => {
  const { title, description, start_date, due_date, status } = updates;
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE task SET title = ?, description = ?, start_date = ?, due_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?',
      [title, description, start_date, due_date, status, task_id]
    );
    return { task_id, title, description, start_date, due_date, status };
  } finally {
    connection.release();
  }
};

export const updateTaskStatus = async (task_id, status) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE task SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?',
      [status, task_id]
    );
    return { task_id, status };
  } finally {
    connection.release();
  }
};

export const deleteTask = async (task_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM task WHERE task_id = ?', [task_id]);
  } finally {
    connection.release();
  }
};

export const getAssignedWorkers = async (task_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT user.user_id, user.name, user.email FROM task_assignment JOIN user ON task_assignment.worker_id = user.user_id WHERE task_assignment.task_id = ?',
      [task_id]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const findTasksDueTodayByManager = async (manager_id) => {
  const connection = await pool.getConnection();
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = `
      SELECT t.*, p.name as project_name 
      FROM task t
      JOIN project p ON t.project_id = p.project_id
      WHERE p.assigned_manager_id = ? 
      AND t.due_date = ? 
      AND t.status != 'Completed'
    `;
    const [rows] = await connection.query(query, [manager_id, today]);
    return rows;
  } finally {
    connection.release();
  }
};
