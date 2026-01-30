# Quick Start Guide - Field Harmony Hub

## Prerequisites
- Node.js v16+ installed
- MySQL server installed and running
- Git (optional, for version control)

## 1. Database Setup (First Time Only)

### Start MySQL Server
```bash
# Windows
# MySQL should start automatically, or start it from MySQL Workbench
# Or use command line if MySQL is installed as service
```

### Create Database
Open MySQL Workbench or MySQL CLI and run:
```sql
CREATE DATABASE field_harmony_hub;
```

## 2. Backend Setup & Run

```bash
# Navigate to Backend folder
cd Backend

# Install dependencies (first time only)
npm install

# Initialize database tables
npm run db:setup

# Start development server
npm run dev
```

**Expected Output:**
```
Server is running on http://localhost:3000
Database tables initialized
```

Keep this terminal open.

## 3. Frontend Setup & Run (In New Terminal)

```bash
# Navigate to root folder (from Backend folder)
cd ..

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## 4. Access the Application

Open your browser and go to: **http://localhost:5173**

## 5. Testing the Features

### Sample Users (Create in Database)

First, add sample users to test each role. Open MySQL and run:

```sql
-- Insert sample users with password 'password123'
INSERT INTO user (name, email, password, role, manager_id, created_at) VALUES
('Admin User', 'admin@example.com', '$2b$10$...hashed_password...', 'ADMIN', NULL, NOW()),
('Manager User', 'manager@example.com', '$2b$10$...hashed_password...', 'MANAGER', NULL, NOW()),
('Worker User 1', 'worker1@example.com', '$2b$10$...hashed_password...', 'WORKER', 2, NOW()),
('Worker User 2', 'worker2@example.com', '$2b$10$...hashed_password...', 'WORKER', 2, NOW());
```

**Or use a simpler approach - modify database.js temporarily to use plain passwords, then hash them:**

The easier way is to use the API directly:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{
    "name": "Sample Worker",
    "email": "worker@example.com",
    "password": "password123",
    "role": "WORKER",
    "manager_id": 2
  }'
```

### Feature Testing

#### 1. **Login**
- Email: `worker@example.com`
- Password: `password123`
- Get redirected to Worker Dashboard

#### 2. **Check Attendance**
- Allow browser location access when prompted
- Click "Check In" button
- GPS coordinates are recorded with time
- Click "Check Out" when done
- View attendance history

#### 3. **Apply for Leave**
- Navigate to "Apply Leave"
- Select leave type, dates, and reason
- Leave balance is calculated
- Submit and see in history as "PENDING"

#### 4. **Submit Report**
- Navigate to "Submit Report"
- Select from assigned tasks
- Add work description
- Upload up to 5 photos (optional)
- Submit report

#### 5. **Manager Login**
- Email: `manager@example.com`
- Password: `password123`
- See Manager Dashboard with your team
- View worker tasks and reports

#### 6. **Admin Login**
- Email: `admin@example.com`
- Password: `password123`
- See Admin Dashboard
- Manage all users, projects, and tasks

## Debugging

### Check Backend Logs
Terminal 1 (Backend) shows:
- All API requests
- Database queries
- Any errors with details

### Check Frontend Logs
Open browser DevTools: **F12** → Console tab
- Shows API response data
- Frontend errors
- Network requests in Network tab

### Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform any action (login, check-in, submit form)
4. See requests to `http://localhost:3000/api/...`
5. Check request headers (Authorization) and response data

## Stopping the Application

### Stop Backend
Terminal 1: Press `Ctrl + C`

### Stop Frontend
Terminal 2: Press `Ctrl + C`

## Restarting

Just run the same commands again:

```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2
npm run dev
```

## Common Issues

### "Cannot connect to database"
- Check MySQL is running
- Verify database credentials in `Backend/config/database.js`

### "Port 3000 already in use"
- Another process is using port 3000
- Kill the process or change port in `.env`

### "Port 5173 already in use"
- Another process is using port 5173
- Kill the process or it will auto-increment to 5174

### "Login fails with 'Invalid credentials'"
- Make sure user exists in database
- Password must match (encrypted with bcryptjs)
- Check database.js has correct MySQL credentials

### "Location not working"
- Allow browser permission for location
- Check if browser window is focused
- May not work on private/incognito mode in some browsers

### "Images not uploading"
- Check browser console for file size errors
- Max 5 images per report
- Images are converted to base64 for JSON submission

## Project Structure

```
field-harmony-hub/
├── Backend/                    # Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── src/                       # React Frontend
│   ├── pages/
│   ├── components/
│   ├── services/              # API client
│   ├── context/               # Auth context
│   └── index.css
├── .env                       # Frontend API URL
├── package.json               # Frontend dependencies
├── vite.config.ts            # Vite configuration
└── INTEGRATION_GUIDE.md       # Detailed integration docs
```

## API Documentation

### Key Endpoints

**Authentication:**
- `POST /api/auth/login` - Login user

**Users:**
- `GET /api/users` - Get all users
- `POST /api/auth/register` - Register new user (admin only)

**Projects:**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project

**Tasks:**
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/task-assignments?worker_id={id}` - Get worker tasks

**Attendance:**
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance?user_id={id}` - Get attendance history

**Leave:**
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves?user_id={id}` - Get leave requests
- `PUT /api/leaves/{id}` - Approve/reject leave

**Reports:**
- `POST /api/daily-reports` - Submit daily report
- `GET /api/daily-reports?user_id={id}` - Get reports

All requests must include: `Authorization: Bearer <jwt_token>`

## ✅ Integration Status

### All Pages Connected to Backend

**Worker Pages** ✅
- WorkerDashboard - Real data from 4 APIs
- WorkerTasks - Task assignments with status updates
- WorkerAttendance - GPS tracking integration  
- WorkerApplyLeave - Leave management
- WorkerSubmitReport - Daily reports with image upload

**Manager Pages** ✅
- ManagerDashboard - Team analytics and real-time stats
- ManagerTasks - Task CRUD operations

**Admin Pages** ✅
- AdminDashboard - System-wide analytics
- Projects/Managers/Workers - Ready for integration

### Key Features Implemented

✅ JWT Authentication with role-based access control
✅ Real-time data fetching from all endpoints
✅ Error handling with toast notifications
✅ Loading states for better UX
✅ GPS-based attendance tracking
✅ Leave request approval system
✅ Task management with status updates

## Support & Help

### Check Documentation
- See `INTEGRATION_GUIDE.md` for detailed integration info
- See `INTEGRATION_COMPLETION_REPORT.md` for full status
- See `Backend/README.md` for backend setup details

### View Error Details
1. Backend errors: Check Terminal 1 logs
2. Frontend errors: Check DevTools Console
3. API errors: Check Network tab response

---

**Happy Testing! 🚀**
