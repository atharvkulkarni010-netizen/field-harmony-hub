# Architecture Diagram - Field Harmony Hub Full Stack

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                  │
│                    (localhost:5173)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend                               │  │
│  │  ┌────────────────┐  ┌────────────┐  ┌──────────────────────┐  │  │
│  │  │   Login Page   │  │ Dashboard  │  │   Worker Pages       │  │  │
│  │  │                │  │            │  │ - ApplyLeave         │  │  │
│  │  │                │  │            │  │ - Attendance         │  │  │
│  │  │                │  │            │  │ - SubmitReport       │  │  │
│  │  └────────────────┘  └────────────┘  └──────────────────────┘  │  │
│  │         │                  │                      │             │  │
│  │         └──────────────────┼──────────────────────┘             │  │
│  │                            │                                    │  │
│  │         ┌──────────────────▼────────────────────┐               │  │
│  │         │    AuthContext                       │               │  │
│  │         │  - User state                        │               │  │
│  │         │  - Token management                  │               │  │
│  │         │  - Login/logout logic                │               │  │
│  │         └──────────────────┬────────────────────┘               │  │
│  │                            │                                    │  │
│  │         ┌──────────────────▼────────────────────┐               │  │
│  │         │    API Service (api.ts)              │               │  │
│  │         │  - authApi                           │               │  │
│  │         │  - usersApi                          │               │  │
│  │         │  - projectsApi                       │               │  │
│  │         │  - tasksApi                          │               │  │
│  │         │  - attendanceApi                     │               │  │
│  │         │  - leaveApi                          │               │  │
│  │         │  - dailyReportsApi                   │               │  │
│  │         │  - Axios Interceptors (JWT)          │               │  │
│  │         └──────────────────┬────────────────────┘               │  │
│  │                            │                                    │  │
│  └────────────────────────────┼────────────────────────────────────┘  │
│                               │ HTTP Requests                         │
│                               │ port 5173 → port 3000               │
└───────────────────────────────┼────────────────────────────────────────┘
                                │
                ┌───────────────▼───────────────┐
                │   Network Layer               │
                │  (HTTP/TCP)                   │
                │  Authorization: Bearer {JWT}  │
                └───────────────┬───────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│                     EXPRESS.JS API SERVER                              │
│                      (localhost:3000)                                  │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Routes Layer                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ /auth    │ │ /users   │ │ /tasks   │ │ /attendance      │  │ │
│  │  │          │ │          │ │          │ │ /leaves          │  │ │
│  │  │ POST     │ │ GET      │ │ POST     │ │ /daily-reports   │  │ │
│  │  │ login    │ │ register │ │ GET      │ │ /manager-reports │  │ │
│  │  │          │ │ update   │ │ DELETE   │ │                  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ │
│  └──────────────────────┬───────────────────────────────────────────┘ │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────────┐ │
│  │                 Middleware Layer                                 │ │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐   │ │
│  │  │ verifyToken  │  │ authorize()      │  │ checkHierarchy  │   │ │
│  │  │              │  │                  │  │                 │   │ │
│  │  │ Validates    │  │ Role-based       │  │ Manager/Worker  │   │ │
│  │  │ JWT tokens   │  │ access control   │  │ permissions     │   │ │
│  │  └──────────────┘  └──────────────────┘  └─────────────────┘   │ │
│  └──────────────────────┬───────────────────────────────────────────┘ │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────────┐ │
│  │                  Models Layer (Business Logic)                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ User.js  │ │Project.js│ │ Task.js  │ │ Attendance.js    │  │ │
│  │  │          │ │          │ │          │ │ Leave.js         │  │ │
│  │  │ CRUD ops │ │ Queries  │ │ Updates  │ │ DailyReport.js   │  │ │
│  │  │          │ │ Filters  │ │ Deletes  │ │ ManagerReport.js │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ │
│  └──────────────────────┬───────────────────────────────────────────┘ │
│                         │                                             │
│  ┌──────────────────────▼───────────────────────────────────────────┐ │
│  │                Database Connection Layer                         │ │
│  │        (MySQL2/Promise Connection Pool)                          │ │
│  │        - Connection pooling (10 connections)                     │ │
│  │        - Query queueing                                          │ │
│  │        - Error handling                                          │ │
│  └──────────────────────┬───────────────────────────────────────────┘ │
│                         │                                             │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │
                          │ SQL Queries
                          │ (TCP port 3306)
                          │
        ┌─────────────────▼─────────────────┐
        │   MySQL Database Server           │
        │  (field_harmony_hub)              │
        │                                   │
        │  ┌─────────────────────────────┐ │
        │  │  Tables:                    │ │
        │  │  - user                     │ │
        │  │  - project                  │ │
        │  │  - task                     │ │
        │  │  - task_assignment          │ │
        │  │  - attendance               │ │
        │  │  - leave_request            │ │
        │  │  - daily_report             │ │
        │  │  - report_task              │ │
        │  │  - manager_project_report   │ │
        │  └─────────────────────────────┘ │
        └─────────────────────────────────────┘
```

## Data Flow Diagram

### 1. Authentication Flow

```
User Login
    │
    ▼
┌─────────────────────────┐
│ Frontend Login Page     │
│ - Email input           │
│ - Password input        │
│ - Submit button         │
└────────┬────────────────┘
         │ (email, password)
         ▼
┌─────────────────────────┐
│ authApi.login()         │
│ (src/services/api.ts)   │
└────────┬────────────────┘
         │ POST /api/auth/login
         │ Content-Type: application/json
         ▼
┌─────────────────────────┐
│ Backend: /auth/login    │
│ (Backend/routes/users.js)
└────────┬────────────────┘
         │ Validate credentials
         │ Hash password match
         │ Create JWT token
         ▼
┌─────────────────────────┐
│ Response:               │
│ { token, user }         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Store in sessionStorage │
│ - auth_token            │
│ - auth_user             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AuthContext Updated     │
│ - user state            │
│ - token state           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Redirect to Dashboard   │
│ (based on user.role)    │
└─────────────────────────┘
```

### 2. API Request Flow (After Login)

```
Frontend Action
(e.g., Check-In Button)
    │
    ▼
┌──────────────────────────┐
│ attendanceApi.checkIn()  │
│ with location data       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Request Interceptor                      │
│ (api.ts - interceptors.request.use)      │
│ - Get token from sessionStorage           │
│ - Add to request headers:                 │
│   Authorization: Bearer {token}           │
└────────┬─────────────────────────────────┘
         │
         │ HTTP POST
         │ /api/attendance/check-in
         │ Headers: Authorization: Bearer xxx
         │ Body: { check_in_latitude, ... }
         │
         ▼
┌──────────────────────────────────────────┐
│ Backend Express Router                   │
│ POST /api/attendance/check-in             │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Middleware: verifyToken                  │
│ - Extract token from header              │
│ - Verify JWT signature                   │
│ - Add user data to req.user              │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Middleware: authorize('WORKER')          │
│ - Check if user.role === 'WORKER'        │
│ - Prevent unauthorized access            │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Controller Logic (route handler)         │
│ - Get current date                       │
│ - Create/update attendance record        │
│ - Save to database                       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Database Query (Model)                   │
│ INSERT/UPDATE attendance table           │
│ with user_id, timestamp, GPS coords      │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Response                                 │
│ 200 OK                                   │
│ { attendance_id, date, status, ... }     │
└────────┬─────────────────────────────────┘
         │
         │ Response Interceptor
         │ (api.ts - interceptors.response)
         │ If 401: logout & redirect to login
         │ If error: pass error to catch block
         │
         ▼
┌──────────────────────────────────────────┐
│ Frontend: handleCheckInOut()             │
│ - Catch error or success                 │
│ - Show toast notification                │
│ - Update local state                     │
│ - Refresh attendance history             │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ UI Updated                               │
│ - Spinner removed                        │
│ - Status changed to "Checked In"         │
│ - New record in history                  │
└──────────────────────────────────────────┘
```

## Component Dependencies

```
App.tsx
    │
    ├── AuthProvider
    │   └── AuthContext
    │       ├── useAuth() hook
    │       └── login/logout functions
    │
    ├── Router
    │   ├── /login → Login.tsx
    │   │   └── useAuth() + authApi.login()
    │   │
    │   ├── /worker → WorkerDashboard.tsx
    │   │   ├── ApplyLeave.tsx
    │   │   │   └── leaveApi
    │   │   ├── WorkerAttendance.tsx
    │   │   │   └── attendanceApi
    │   │   ├── SubmitReport.tsx
    │   │   │   └── dailyReportsApi + taskAssignmentsApi
    │   │   └── WorkerTasks.tsx
    │   │       └── tasksApi
    │   │
    │   ├── /manager → ManagerDashboard.tsx
    │   │   ├── ManagerTasks.tsx
    │   │   └── Uses: tasksApi, projectsApi, usersApi
    │   │
    │   └── /admin → AdminDashboard.tsx
    │       ├── Projects.tsx → projectsApi
    │       ├── Managers.tsx → usersApi
    │       └── Workers.tsx → usersApi
    │
    └── UI Components (shadcn/ui)
        ├── Card, Button, Input, etc.
        └── Shared across all pages
```

## Token & Authorization Flow

```
Session Lifecycle:
├── User Logs In
│   └── Backend returns JWT token
│       └── Token stored in sessionStorage
│           └── Valid for session duration
│
├── User Makes API Request
│   └── Interceptor adds token to header
│       ├── Authorization: Bearer {token}
│       └── Sent with every request
│
├── Backend Verifies Token
│   ├── Valid → Process request
│   ├── Expired (401) → Return 401
│   └── Invalid → Return 401
│
├── Frontend Gets 401 Response
│   ├── Remove token from sessionStorage
│   ├── Clear user data
│   └── Redirect to /login
│
└── User Logs Out
    └── Clear sessionStorage
        └── Redirect to /login
```

## Deployment Architecture (Production)

```
┌────────────────────────────┐
│   User's Browser           │
│   (any device, worldwide)  │
└────────────────┬───────────┘
                 │ HTTPS
                 │
    ┌────────────▼──────────────┐
    │  CDN / Static Hosting     │
    │  (Vercel, Netlify, AWS S3)│
    │  - React app (dist/)      │
    │  - .env.production        │
    └────────────┬──────────────┘
                 │ HTTPS
                 │ (API calls)
    ┌────────────▼──────────────┐
    │   Cloud Load Balancer     │
    │   (AWS ALB, Google LB)    │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────┐
    │  Node.js API Server(s)    │
    │  (EC2, App Engine, etc.)  │
    │  (Multiple instances)     │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────┐
    │  MySQL Database (RDS)     │
    │  (Managed service)        │
    │  (Automated backups)      │
    └───────────────────────────┘
```

---

## Integration Points Summary

| Frontend | API Endpoint | Backend | Database |
|----------|--------------|---------|----------|
| Login | POST /api/auth/login | User.findByEmail() + bcrypt | user table |
| Apply Leave | POST /api/leaves | Leave.create() | leave_request |
| View Leaves | GET /api/leaves | Leave.findByUser() | leave_request |
| Check In | POST /api/attendance/check-in | Attendance.create() | attendance |
| Check Out | POST /api/attendance/check-out | Attendance.update() | attendance |
| Submit Report | POST /api/daily-reports | DailyReport.create() | daily_report |
| Get Tasks | GET /api/task-assignments | TaskAssignment.findByWorker() | task_assignment |
| Get Projects | GET /api/projects | Project.findAll() | project |

---

This architecture ensures:
- ✅ **Scalability** - Can add more Node.js instances
- ✅ **Security** - JWT authentication + role-based access
- ✅ **Reliability** - Error handling at multiple layers
- ✅ **Performance** - Connection pooling, caching ready
- ✅ **Maintainability** - Clear separation of concerns
