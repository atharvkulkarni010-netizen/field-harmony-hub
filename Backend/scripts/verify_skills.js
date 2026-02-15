
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const verifySkills = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [rows] = await pool.query(`
      SELECT u.name, GROUP_CONCAT(s.name) as skills
      FROM user u
      JOIN user_skill us ON u.user_id = us.user_id
      JOIN skill s ON us.skill_id = s.skill_id
      WHERE u.role = 'WORKER'
      GROUP BY u.user_id
    `);

        console.log("Worker Skills:");
        rows.forEach(r => console.log(`${r.name}: ${r.skills}`));

    } catch (error) {
        console.error("Error verifying skills:", error);
    } finally {
        pool.end();
    }
};

verifySkills();
