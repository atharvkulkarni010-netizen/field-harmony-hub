import pool from './database.js';

// Create User table
export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'WORKER')),
      manager_id INT REFERENCES user(user_id),
      force_password_reset BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);

  // Migration: Add force_password_reset column if it doesn't exist
  try {
    await connection.query("ALTER TABLE user ADD COLUMN force_password_reset BOOLEAN DEFAULT TRUE");
    console.log("Added force_password_reset column to user table");
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error("Error adding force_password_reset column:", error);
    }
  }

  // Migration: Add is_verified column if it doesn't exist
  try {
    await connection.query("ALTER TABLE user ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
    console.log("Added is_verified column to user table");
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      // console.error("Error adding is_verified column:", error);
    }
  }

  // Migration: Add verification_token column if it doesn't exist
  try {
    await connection.query("ALTER TABLE user ADD COLUMN verification_token VARCHAR(255)");
    console.log("Added verification_token column to user table");
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      // console.error("Error adding verification_token column:", error);
    }
  }

  connection.release();
  console.log('User table created/updated');
};

// Create Project table
export const createProjectTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS project (
      project_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) NOT NULL DEFAULT 'Yet to start' CHECK (status IN ('Yet to start', 'Ongoing', 'In Review', 'Completed')),
      assigned_manager_id INT NOT NULL REFERENCES user(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Project table created');
};

// Create Task table
export const createTaskTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS task (
      task_id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL REFERENCES project(project_id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      due_date DATE,
      status VARCHAR(50) NOT NULL DEFAULT 'Yet to start' CHECK (status IN ('Yet to start', 'Ongoing', 'In Review', 'Completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Task table created');
};

// Create Task_Assignment table
export const createTaskAssignmentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS task_assignment (
      assignment_id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL REFERENCES task(task_id),
      worker_id INT NOT NULL REFERENCES user(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_task_worker (task_id, worker_id)
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Task_Assignment table created');
};

// Create Attendance table
export const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL REFERENCES user(user_id),
      date DATE NOT NULL,
      check_in_time TIME,
      check_in_latitude DECIMAL(10, 8),
      check_in_longitude DECIMAL(11, 8),
      check_out_time TIME,
      check_out_latitude DECIMAL(10, 8),
      check_out_longitude DECIMAL(11, 8),
      status VARCHAR(50) NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'INCOMPLETE', 'LEAVE')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_date (user_id, date)
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Attendance table created');
};

// Create Leave table
export const createLeaveTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS leave_request (
      leave_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL REFERENCES user(user_id),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
      approved_by INT REFERENCES user(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Leave table created');
};

// Create Daily_Report table
export const createDailyReportTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS daily_report (
      report_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL REFERENCES user(user_id),
      report_date DATE NOT NULL,
      description TEXT,
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Daily_Report table created');
};

// Create Report_Task table
export const createReportTaskTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS report_task (
      report_task_id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL REFERENCES daily_report(report_id),
      task_id INT NOT NULL REFERENCES task(task_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_report_task (report_id, task_id)
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Report_Task table created');
};

// Create Manager_Project_Report table
export const createManagerProjectReportTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS manager_project_report (
      manager_report_id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL UNIQUE REFERENCES project(project_id),
      manager_id INT NOT NULL REFERENCES user(user_id),
      summary TEXT,
      outcomes TEXT,
      challenges TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Manager_Project_Report table created');
};

// Create Token Blacklist table
export const createTokenBlacklistTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token TEXT NOT NULL,
      user_id INT NOT NULL REFERENCES user(user_id),
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token(255)),
      INDEX idx_user_id (user_id),
      INDEX idx_expires_at (expires_at)
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('Token_Blacklist table created');
};

// Create OTP Store table
export const createOtpStoreTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS otp_store (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_expires_at (expires_at)
    );
  `;
  const connection = await pool.getConnection();
  await connection.query(query);
  connection.release();
  console.log('OTP_Store table created');
};

// Create all tables
export const createAllTables = async () => {
  try {
    await createUserTable();
    await createProjectTable();
    await createTaskTable();
    await createTaskAssignmentTable();
    await createAttendanceTable();
    await createLeaveTable();
    await createDailyReportTable();
    await createReportTaskTable();
    await createManagerProjectReportTable();
    await createTokenBlacklistTable();
    await createOtpStoreTable();
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
