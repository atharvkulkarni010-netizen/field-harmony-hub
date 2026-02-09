import { createAllTables } from '../config/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');
    await createAllTables();
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
