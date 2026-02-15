
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const testQuery = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const query = `
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
        const [rows] = await pool.query(query);
        console.log("Query successful. Rows:", rows.length);
        if (rows.length > 0) {
            console.log("First row skills:", rows[0].skills);
        }
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        pool.end();
    }
};

testQuery();
