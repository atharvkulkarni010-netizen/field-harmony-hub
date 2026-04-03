
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
dotenv.config();

const analyzeData = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Get all projects
        const [projects] = await pool.query('SELECT project_id, name FROM project');
        let output = `Projects found: ${projects.length}\n`;
        projects.forEach(p => output += `- ${p.name} (ID: ${p.project_id})\n`);

        // Get workers and their projects (via tasks)
        const [rows] = await pool.query(`
      SELECT DISTINCT u.user_id, u.name as worker_name, p.name as project_name
      FROM user u
      JOIN task_assignment ta ON u.user_id = ta.worker_id
      JOIN task t ON ta.task_id = t.task_id
      JOIN project p ON t.project_id = p.project_id
      WHERE u.role = 'WORKER'
    `);

        output += "\nWorker Project Assignments:\n";
        rows.forEach(r => output += `${r.worker_name} -> ${r.project_name}\n`);

        await fs.writeFile('analysis.txt', output);
        console.log("Analysis written to analysis.txt. Content length: " + output.length);

    } catch (error) {
        console.error("Error analyzing data:", error);
    } finally {
        pool.end();
    }
};

analyzeData();
