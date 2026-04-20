import pool from '../config/database.js';

export const createProject = async (name, description, start_date, end_date, assigned_manager_id, geofence_latitude = null, geofence_longitude = null, geofence_radius = 500) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO project (name, description, start_date, end_date, assigned_manager_id, geofence_latitude, geofence_longitude, geofence_radius) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, start_date, end_date, assigned_manager_id, geofence_latitude, geofence_longitude, geofence_radius]
    );
    return { project_id: result.insertId, name, description, start_date, end_date, assigned_manager_id, geofence_latitude, geofence_longitude, geofence_radius };
  } finally {
    connection.release();
  }
};

export const findProjectById = async (project_id) => {
  const connection = await pool.getConnection();
  try {
    // 1. Get Project Details
    const [projectRows] = await connection.query(`
      SELECT 
        p.*, 
        u.name as manager_name
      FROM project p
      LEFT JOIN user u ON p.assigned_manager_id = u.user_id
      WHERE p.project_id = ?
    `, [project_id]);

    if (projectRows.length === 0) return null;
    const project = projectRows[0];

    // 2. Get Tasks
    const [taskRows] = await connection.query(`
      SELECT 
        t.*, 
        u.name as worker_name 
      FROM task t
      LEFT JOIN task_assignment ta ON t.task_id = ta.task_id
      LEFT JOIN user u ON ta.worker_id = u.user_id
      WHERE t.project_id = ?
      ORDER BY t.due_date ASC
    `, [project_id]);

    // 3. Get Team Members (Workers assigned to tasks in this project)
    const [teamRows] = await connection.query(`
      SELECT DISTINCT 
        u.user_id, 
        u.name, 
        u.role 
      FROM task t
      JOIN task_assignment ta ON t.task_id = ta.task_id
      JOIN user u ON ta.worker_id = u.user_id
      WHERE t.project_id = ?
    `, [project_id]);

    return {
      ...project,
      tasks: taskRows,
      team: teamRows,
      // Calculate derived stats
      total_tasks: taskRows.length,
      completed_tasks: taskRows.filter(t => t.status === 'Completed').length,
      // detailed activity log
      activityLog: [
        // Project creation
        {
          action: 'Project Created',
          description: `Project ${project.name} was created`,
          timestamp: project.created_at,
          type: 'project',
          user: project.manager_name
        },
        // Task creations
        ...taskRows.map(t => ({
          action: 'Task Created',
          description: `Task "${t.title}" was created`,
          timestamp: t.created_at,
          type: 'task',
          user: t.manager_name || 'Manager' // Assuming manager created it
        })),
        // Task completions
        ...taskRows.filter(t => t.status === 'Completed').map(t => ({
          action: 'Task Completed',
          description: `Task "${t.title}" was marked as completed`,
          timestamp: t.updated_at, // Approximate completion time
          type: 'task',
          user: t.worker_name
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
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
  const { name, description, start_date, end_date, status, geofence_latitude, geofence_longitude, geofence_radius } = updates;
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE project SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, geofence_latitude = ?, geofence_longitude = ?, geofence_radius = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?',
      [name, description, start_date, end_date, status, geofence_latitude || null, geofence_longitude || null, geofence_radius || 500, project_id]
    );
    return { project_id, name, description, start_date, end_date, status, geofence_latitude, geofence_longitude, geofence_radius };
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
    await connection.beginTransaction();

    // 1. Fetch related tasks to delete their downstream dependencies
    const [tasks] = await connection.query('SELECT task_id FROM task WHERE project_id = ?', [project_id]);
    const taskIds = tasks.map(t => t.task_id);

    if (taskIds.length > 0) {
      await connection.query('DELETE FROM task_assignment WHERE task_id IN (?)', [taskIds]);
      await connection.query('DELETE FROM report_task WHERE task_id IN (?)', [taskIds]);
    }

    // 2. Cascade delete core project dependencies
    await connection.query('DELETE FROM task WHERE project_id = ?', [project_id]);
    await connection.query('DELETE FROM manager_project_report WHERE project_id = ?', [project_id]);

    // 3. Wipe the primary project record
    await connection.query('DELETE FROM project WHERE project_id = ?', [project_id]);
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const reassignProjects = async (old_manager_id, new_manager_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE project SET assigned_manager_id = ? WHERE assigned_manager_id = ?',
      [new_manager_id, old_manager_id]
    );
  } finally {
    connection.release();
  }
};
