import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Atharv@24Nov',
  database: 'field_harmony_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
