
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const checkTables = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables in database:");
        rows.forEach(row => console.log(Object.values(row)[0]));
    } catch (error) {
        console.error("Error checking tables:", error);
    } finally {
        pool.end();
    }
};

checkTables();
