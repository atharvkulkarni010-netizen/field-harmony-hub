import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  try {
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Atharv@24Nov',
    });

    console.log('Creating database field_harmony_hub...');
    await connection.query('CREATE DATABASE IF NOT EXISTS field_harmony_hub');
    console.log('Database created successfully!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createDatabase();
