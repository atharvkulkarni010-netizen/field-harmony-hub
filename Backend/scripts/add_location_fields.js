import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if columns exist
        const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project' AND COLUMN_NAME IN ('location', 'google_maps_link', 'location_type')
    `, [dbConfig.database]);

        const existingColumns = columns.map(c => c.COLUMN_NAME);

        // Add location column
        if (!existingColumns.includes('location')) {
            await connection.query(`ALTER TABLE project ADD COLUMN location VARCHAR(255) DEFAULT NULL`);
            console.log('Added column: location');
        } else {
            console.log('Column location already exists.');
        }

        // Add google_maps_link column
        if (!existingColumns.includes('google_maps_link')) {
            await connection.query(`ALTER TABLE project ADD COLUMN google_maps_link TEXT DEFAULT NULL`);
            console.log('Added column: google_maps_link');
        } else {
            console.log('Column google_maps_link already exists.');
        }

        // Add location_type column
        if (!existingColumns.includes('location_type')) {
            await connection.query(`ALTER TABLE project ADD COLUMN location_type ENUM('On-site', 'Remote', 'Hybrid') DEFAULT 'On-site'`);
            console.log('Added column: location_type');
        } else {
            console.log('Column location_type already exists.');
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
