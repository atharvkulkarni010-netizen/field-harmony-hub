# Field Harmony Hub - Backend

Backend for NGO Field Operations Management System

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### 2. Installation

```bash
cd Backend
npm install
```

### 3. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE field_harmony_hub;
```

#### Configure Environment Variables

Create a `.env` file in the Backend directory with:
```
DATABASE_URL=mysql://root:Atharv@24Nov@localhost:3306/field_harmony_hub
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
```

**Note:** Update the MySQL credentials as needed:
- `root` - your MySQL username
- `Atharv@24Nov` - your MySQL password
- `localhost` - your MySQL host
- `3306` - your MySQL port
- `field_harmony_hub` - database name

### 4. Initialize Database Tables

Run the setup script to create all tables:
```bash
npm run db:setup
```

### 5. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This creates sample users for testing:
- **Admin**: admin@ngo.com / admin123
- **Manager 1**: john.manager@ngo.com / manager123
- **Manager 2**: jane.manager@ngo.com / manager123
- **Workers**: worker{1,2,3}@ngo.com / worker123

### 6. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (ADMIN only)

### Users
- `GET /api/users` - Get all users (ADMIN only)
- `GET /api/users/:user_id` - Get user details
- `PUT /api/users/:user_id` - Update user
- `DELETE /api/users/:user_id` - Delete user (ADMIN only)
- `GET /api/users/manager/:manager_id/workers` - Get workers under manager

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get projects
- `GET /api/projects/:project_id` - Get project details
- `PUT /api/projects/:project_id` - Update project
- `PATCH /api/projects/:project_id/status` - Update project status
- `DELETE /api/projects/:project_id` - Delete project

### Tasks
- `POST /api/tasks/project/:project_id` - Create task
- `GET /api/tasks/project/:project_id` - Get project tasks
- `GET /api/tasks/:task_id` - Get task details
- `PUT /api/tasks/:task_id` - Update task
- `PATCH /api/tasks/:task_id/status` - Update task status
- `DELETE /api/tasks/:task_id` - Delete task

### Task Assignments
- `POST /api/task-assignments` - Assign task to worker
- `GET /api/task-assignments/task/:task_id` - Get task assignments
- `GET /api/task-assignments/worker/:worker_id` - Get worker assignments
- `DELETE /api/task-assignments/:assignment_id` - Remove assignment

### Attendance
- `POST /api/attendance/check-in` - Worker check-in
- `PATCH /api/attendance/:attendance_id/check-out` - Worker check-out
- `GET /api/attendance/user/:user_id` - Get user attendance
- `PATCH /api/attendance/:attendance_id/status` - Update attendance status

### Leaves
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/worker/:worker_id` - Get worker leave requests
- `GET /api/leaves/pending/all` - Get pending leave requests
- `PATCH /api/leaves/:leave_id/approve` - Approve leave
- `PATCH /api/leaves/:leave_id/reject` - Reject leave
- `GET /api/leaves/:leave_id` - Get leave details

### Daily Reports
- `POST /api/daily-reports` - Create daily report
- `GET /api/daily-reports/worker/:worker_id` - Get worker reports
- `GET /api/daily-reports/:report_id` - Get report details
- `PUT /api/daily-reports/:report_id` - Update report
- `POST /api/daily-reports/:report_id/tasks` - Add task to report
- `DELETE /api/daily-reports/:report_id` - Delete report

### Manager Project Reports
- `POST /api/manager-reports` - Create project report
- `GET /api/manager-reports/project/:project_id` - Get project report
- `GET /api/manager-reports/manager/:manager_id` - Get manager reports
- `GET /api/manager-reports` - Get all reports (ADMIN)
- `GET /api/manager-reports/:report_id` - Get report details
- `PUT /api/manager-reports/:report_id` - Update report
- `DELETE /api/manager-reports/:report_id` - Delete report

## Authentication

All API endpoints (except login/register) require JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## User Roles & Permissions

### ADMIN
- Full system access
- Create/manage users
- View all projects and reports
- Cannot submit reports

### MANAGER
- Manage their assigned projects
- Create and update tasks
- Assign tasks to workers
- Approve/reject leave requests
- View worker attendance and reports
- Submit project reports

### WORKER
- View assigned tasks
- Submit daily reports
- Apply for leave
- Check-in/check-out for attendance
- View own data only

## Database Schema

All tables are created automatically on server startup. The backend uses MySQL with the following tables:
- `user` - User accounts with hierarchical roles
- `project` - Projects assigned to managers
- `task` - Tasks within projects
- `task_assignment` - Many-to-many task to worker assignments
- `attendance` - Location-based attendance records
- `leave_request` - Leave requests with approval workflow
- `daily_report` - Worker daily reports
- `report_task` - Links daily reports to tasks
- `manager_project_report` - Overall project reports

## Error Handling

All endpoints return consistent error responses:
```json
{
  "message": "Error description"
}
```

## Development Notes

- Database tables are automatically created if they don't exist on server startup
- Password hashing uses bcryptjs
- JWT tokens expire after 7 days by default
- Location-based attendance using latitude/longitude coordinates
- Images in daily reports stored as JSON arrays
- Uses MySQL connection pooling for better performance

## Support

For issues or questions, contact the development team.
