import pool from '../config/database.js';

export const createProject = async (name, description, start_date, end_date, assigned_manager_id) => {
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
};

export const findProjectById = async (project_id) => {
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
};

export const findAllProjects = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT t.task_id) as total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        COUNT(DISTINCT ta.worker_id) as assigned_workers_count
      FROM project p
      LEFT JOIN task t ON p.project_id = t.project_id
      LEFT JOIN task_assignment ta ON t.task_id = ta.task_id
      GROUP BY p.project_id
    `);
    return rows;
  } finally {
    connection.release();
  }
};

export const findProjectsByManager = async (manager_id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT t.task_id) as total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        COUNT(DISTINCT ta.worker_id) as assigned_workers_count
      FROM project p
      LEFT JOIN task t ON p.project_id = t.project_id
      LEFT JOIN task_assignment ta ON t.task_id = ta.task_id
      WHERE p.assigned_manager_id = ?
      GROUP BY p.project_id
    `, [manager_id]);
    return rows;
  } finally {
    connection.release();
  }
};

export const updateProject = async (project_id, updates) => {
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
};

export const updateProjectStatus = async (project_id, status) => {
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
};

export const deleteProject = async (project_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM project WHERE project_id = ?', [project_id]);
  } finally {
    connection.release();
  }
};
