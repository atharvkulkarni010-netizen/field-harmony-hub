import pool from '../config/database.js';
import * as userService from '../services/userService.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create an admin user
    const admin = await userService.createUser(
      'Admin User',
      'admin@ngo.com',
      'admin123', // This will be hashed
      'ADMIN'
    );
    console.log('Admin user created:', admin);

    // Create sample managers
    const manager1 = await userService.createUser(
      'John Manager',
      'john.manager@ngo.com',
      'manager123',
      'MANAGER',
      null
    );
    console.log('Manager 1 created:', manager1);

    const manager2 = await userService.createUser(
      'Jane Manager',
      'jane.manager@ngo.com',
      'manager123',
      'MANAGER',
      null
    );
    console.log('Manager 2 created:', manager2);

    // Create sample workers
    const worker1 = await userService.createUser(
      'Worker One',
      'worker1@ngo.com',
      'worker123',
      'WORKER',
      manager1.user_id
    );
    console.log('Worker 1 created:', worker1);

    const worker2 = await userService.createUser(
      'Worker Two',
      'worker2@ngo.com',
      'worker123',
      'WORKER',
      manager1.user_id
    );
    console.log('Worker 2 created:', worker2);

    const worker3 = await userService.createUser(
      'Worker Three',
      'worker3@ngo.com',
      'worker123',
      'WORKER',
      manager2.user_id
    );
    console.log('Worker 3 created:', worker3);

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Admin: admin@ngo.com / admin123');
    console.log('Manager 1: john.manager@ngo.com / manager123');
    console.log('Manager 2: jane.manager@ngo.com / manager123');
    console.log('Worker 1: worker1@ngo.com / worker123');
    console.log('Worker 2: worker2@ngo.com / worker123');
    console.log('Worker 3: worker3@ngo.com / worker123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
