# Full Stack Integration Guide - Field Harmony Hub

## Overview
This document explains how the frontend and backend are now integrated together as a complete full-stack application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + TypeScript)           │
│                    Running on localhost:5173                 │
└────────────────────────────┬────────────────────────────────┘
                              │ HTTP Requests
                              │ (Axios Interceptors)
                              │
┌─────────────────────────────▼────────────────────────────────┐
│              Backend API (Express.js + Node.js)              │
│                    Running on localhost:3000                 │
│              (Database: MySQL - field_harmony_hub)           │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Backend Setup

```bash
cd Backend
npm install
```

**Configure Database:**
- Create MySQL database: `CREATE DATABASE field_harmony_hub;`
- Update credentials in `Backend/config/database.js` if needed

**Create Tables:**
```bash
npm run db:setup
```

**Start Backend Server:**
```bash
npm run dev  # Uses nodemon for auto-reload
# or
npm start   # Production mode
```

Server will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd .. # Back to root
npm install
```

**Environment Configuration:**
The `.env` file is already created with:
```
VITE_API_URL=http://localhost:3000
```

For production, update `.env.production`:
```
VITE_API_URL=https://api.field-harmony-hub.com
```

**Start Frontend Development Server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Integration Points

### 1. Authentication
- **Endpoint:** `POST /api/auth/login`
- **Frontend File:** `src/context/AuthContext.tsx`
- **Implementation:** Real backend authentication with JWT tokens
- **Token Storage:** Stored in sessionStorage for session duration

**User Roles Mapping:**
- `ADMIN` → Redirects to `/admin`
- `MANAGER` → Redirects to `/manager`
- `WORKER` → Redirects to `/worker`

### 2. Worker Pages Integrated

#### Apply Leave (`src/pages/worker/ApplyLeave.tsx`)
- **POST** `/api/leaves` - Submit leave request
- **GET** `/api/leaves?user_id={userId}` - Fetch leave history
- Calculates leave balance dynamically

#### Check-In/Check-Out (`src/pages/worker/WorkerAttendance.tsx`)
- **POST** `/api/attendance/check-in` - Check in with GPS coordinates
- **POST** `/api/attendance/check-out` - Check out with GPS coordinates
- **GET** `/api/attendance?user_id={userId}` - Fetch attendance history
- Uses browser geolocation API for GPS tracking

#### Submit Daily Report (`src/pages/worker/SubmitReport.tsx`)
- **POST** `/api/daily-reports` - Submit report with description and images
- **GET** `/api/task-assignments?worker_id={workerId}` - Fetch assigned tasks
- Supports multiple image uploads (max 5)

### 3. API Service Configuration

**File:** `src/services/api.ts`

All API endpoints are centralized here with proper organization:

```typescript
export const authApi = { login, logout }
export const usersApi = { getAll, getById, register, update }
export const projectsApi = { getAll, getById, create, update, delete }
export const tasksApi = { getAll, getById, getByProject, create, update, delete }
export const taskAssignmentsApi = { getAll, getByTask, getByWorker, create, delete }
export const attendanceApi = { checkIn, checkOut, getAll, getByUser, getByDate }
export const dailyReportsApi = { submit, getAll, getById, getByUser, update }
export const leaveApi = { apply, getAll, getById, getByUser, approve, reject }
export const managerReportsApi = { submit, getAll, getById, getByProject, update }
```

### 4. Request/Response Interceptors

**Request Interceptor:**
- Automatically adds JWT token from sessionStorage to `Authorization: Bearer {token}` header
- Applied to all API requests

**Response Interceptor:**
- If 401 Unauthorized: Clears auth and redirects to login
- Handles all other errors normally

## Database Schema (No Changes Made)

All existing database tables and relationships remain intact:

- `user` - User accounts with role-based access
- `project` - Field projects
- `task` - Project tasks
- `task_assignment` - Worker task assignments
- `attendance` - Check-in/check-out records with GPS
- `leave_request` - Leave requests and approvals
- `daily_report` - Worker daily progress reports
- `report_task` - Linking reports to tasks
- `manager_project_report` - Manager project summaries

## How to Test

### 1. Login with Sample User

You need to create users in the database first via the backend. Example:

```sql
-- Sample users (passwords are hashed in database)
INSERT INTO user (name, email, password, role, manager_id) VALUES
('Admin User', 'admin@example.com', 'hashed_password', 'ADMIN', NULL),
('Manager User', 'manager@example.com', 'hashed_password', 'MANAGER', NULL),
('Worker User', 'worker@example.com', 'hashed_password', 'WORKER', 2);
```

### 2. Test Worker Features

1. **Check-In/Check-Out:**
   - Allow browser location access when prompted
   - Click "Check In" to record attendance with GPS
   - Click "Check Out" when done

2. **Apply for Leave:**
   - Navigate to "Apply Leave"
   - Select dates and reason
   - Submit request (sent to backend)

3. **Submit Daily Report:**
   - Navigate to "Submit Report"
   - Select assigned tasks (fetched from backend)
   - Add description and photos
   - Submit report with image data

### 3. Verify API Calls

Open browser Developer Tools (F12) → Network tab to see API requests:
- All requests go to `http://localhost:3000/api/*`
- Authorization header includes JWT token
- Response data directly from MySQL database

## Common Issues & Solutions

### Issue: "Cannot GET /api/..." (404 errors)
**Solution:** Make sure backend is running on port 3000
```bash
cd Backend
npm run dev
```

### Issue: "Invalid token" (401 errors)
**Solution:** Login again to get fresh JWT token. Tokens expire based on backend configuration.

### Issue: CORS errors
**Solution:** Backend already has CORS enabled. Check if both are running on correct ports.

### Issue: Location not working
**Solution:** 
- Browser must have location permission granted
- HTTPS required for production (geolocation)
- Works on localhost HTTP for development

### Issue: Images not uploading
**Solution:** Images are converted to base64 and sent as JSON. Check image file size limits.

## Production Deployment

### Frontend (Vite)
```bash
npm run build  # Creates dist/ folder
# Deploy dist/ folder to static hosting (Vercel, Netlify, AWS S3, etc.)
```

### Backend (Node.js)
```bash
npm install  # Install dependencies
npm start    # Run production server
# Deploy to cloud service (Heroku, AWS, DigitalOcean, etc.)
```

**Update Environment Variables:**
- Backend: Set `DATABASE_URL` and `JWT_SECRET` from environment variables
- Frontend: Update `.env.production` with production API URL

## File Structure Reference

```
Frontend (src/)
├── context/
│   └── AuthContext.tsx ............... Authentication with real API
├── services/
│   └── api.ts ....................... All API endpoints
├── pages/
│   ├── Login.tsx .................... Role-based login
│   ├── worker/
│   │   ├── ApplyLeave.tsx ........... Leave management (integrated)
│   │   ├── WorkerAttendance.tsx ..... Check-in/out with GPS (integrated)
│   │   ├── SubmitReport.tsx ......... Daily reports (integrated)
│   │   └── WorkerTasks.tsx .......... Task management
│   ├── manager/
│   │   ├── ManagerDashboard.tsx ..... Manager overview
│   │   └── ManagerTasks.tsx ......... Task assignment
│   └── admin/
│       ├── AdminDashboard.tsx ....... Admin overview
│       ├── Projects.tsx ............ Project management
│       ├── Managers.tsx ............ Manager management
│       └── Workers.tsx ............ Worker management

Backend (Backend/)
├── server.js ........................ Express server entry point
├── config/
│   └── database.js .................. MySQL connection
├── models/
│   ├── schema.js .................... Table creation
│   ├── User.js ..................... User operations
│   ├── Project.js .................. Project operations
│   ├── Task.js ..................... Task operations
│   └── ... (other models)
├── routes/
│   ├── users.js .................... Authentication & user endpoints
│   ├── projects.js ................. Project endpoints
│   ├── tasks.js .................... Task endpoints
│   ├── attendance.js ............... Attendance endpoints
│   └── ... (other routes)
└── middleware/
    ├── auth.js ..................... JWT verification
    └── hierarchy.js ................ Role-based access control
```

## Next Steps to Complete

1. **Admin Dashboard Integration:**
   - Fetch users, projects, managers, workers from API
   - Add project/manager/worker creation forms

2. **Manager Dashboard Integration:**
   - Show assigned projects and workers
   - Add task creation and assignment
   - View team attendance and reports

3. **Additional Features:**
   - Real-time notifications
   - Approval workflows for leaves
   - Analytics and reporting
   - Export functionality

## Support

For issues or questions, check the backend and frontend logs:

**Backend Log:**
```
npm run dev
# Shows all API requests and database operations
```

**Frontend Log:**
Open browser Console (F12) to see frontend errors and API requests

---

**Last Updated:** January 28, 2026
**Integration Status:** ✅ Core features integrated and ready for testing
