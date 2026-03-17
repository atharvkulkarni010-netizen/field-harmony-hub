import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createAllTables } from './config/schema.js';

dotenv.config();
// Import routes
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import taskAssignmentRoutes from './routes/task-assignments.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import dailyReportRoutes from './routes/daily-reports.js';
import managerReportRoutes from './routes/manager-reports.js';
import analyticsRoutes from './routes/analytics.js';
import skillsRoutes from './routes/skills.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-assignments', taskAssignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/manager-reports', managerReportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/skills', skillsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Initializing database tables...');
    await createAllTables();
    console.log('Database tables initialized');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
