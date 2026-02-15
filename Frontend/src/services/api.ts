import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints (to be connected to backend later)
// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  updatePassword: (newPassword: string) => api.put('/auth/change-password', { newPassword }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
  // refreshToken: () => api.post('/auth/refresh'), // Not implemented in backend yet
};

export const usersApi = {
  getManagers: () => api.get('/users/managers'),
  getWorkers: () => api.get('/users/workers'),
  register: (data: { name: string; email: string; role: 'ADMIN' | 'MANAGER' | 'WORKER'; manager_id?: string | null; skills?: string[] }) =>
    api.post('/users/register', data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  getProfile: () => api.get('/users/profile'),
  getManagerWorkers: (managerId: string) => api.get(`/users/manager/${managerId}/workers`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
};

export const skillsApi = {
  getAll: () => api.get('/skills'),
  create: (name: string) => api.post('/skills', { name }),
};

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/projects/${id}/status`, { status }),
  getDetails: (id: string) => api.get(`/projects/${id}`),
  // assign: (projectId: string, managerId: string) => api.put(`/projects/${projectId}`, { assigned_manager_id: managerId }), // Assignment handled via update
};

export const tasksApi = {
  getAll: () => api.get('/tasks'), // Admin only? Or verify backend route
  getByProject: (projectId: string) => api.get(`/tasks/project/${projectId}`),
  create: (projectId: string, data: any) => api.post(`/tasks/project/${projectId}`, data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  assignWorker: (taskId: string, workerId: string) =>
    api.post('/task-assignments', { task_id: taskId, worker_id: workerId }),
  submit: (taskId: string) => api.post(`/tasks/${taskId}/submit`),
  approve: (taskId: string) => api.post(`/tasks/${taskId}/approve`),
  reject: (taskId: string, reason: string) => api.post(`/tasks/${taskId}/reject`, { reason }),
};

export const taskAssignmentsApi = {
  getMyAssignments: () => api.get('/task-assignments/my-assignments'),
};

export const attendanceApi = {
  checkIn: (location: { lat: number; lng: number }) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const check_in_time = now.toLocaleTimeString('en-US', { hour12: false });
    return api.post('/attendance/check-in', {
      date,
      check_in_time,
      check_in_latitude: location.lat,
      check_in_longitude: location.lng
    });
  },
  checkOut: (attendanceId: string, location: { lat: number; lng: number }) => {
    const check_out_time = new Date().toLocaleTimeString('en-US', { hour12: false });
    return api.patch(`/attendance/${attendanceId}/check-out`, {
      check_out_time,
      check_out_latitude: location.lat,
      check_out_longitude: location.lng
    });
  },
  getHistory: (userId: string) => api.get(`/attendance/user/${userId}`),
  getToday: () => api.get('/attendance/today/my-attendance'),
  getTeamAttendance: (date?: string) => api.get('/attendance/manager/team-attendance', { params: { date } }),
  // getByWorker: (workerId: string) => api.get(`/attendance/user/${workerId}`), // Same as getHistory
};

export const leavesApi = {
  apply: (data: any) => api.post('/leaves', data),
  getMyLeaves: (workerId: string) => api.get(`/leaves/worker/${workerId}`),
  getPending: () => api.get('/leaves/pending/all'),
  getTeamLeaves: () => api.get('/leaves/manager/team-leaves'),
  approve: (id: string) => api.patch(`/leaves/${id}/approve`),
  reject: (id: string) => api.patch(`/leaves/${id}/reject`),
};

export const reportsApi = {
  submit: (data: FormData) =>
    api.post('/daily-reports', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getTaskReports: (taskId: string) => api.get(`/daily-reports/task/${taskId}`),
  getMyReports: () => api.get('/daily-reports/worker/me'), // This endpoint needs adjustment in backend if 'me' is not handled, but usually handled by /worker/:id with user.id
  getByWorker: (workerId: string) => api.get(`/daily-reports/worker/${workerId}`),
  getTeamReports: (date: string) => api.get('/daily-reports/manager/team-reports', { params: { date } }),
};

export const leaveApi = {
  apply: (data: any) => api.post('/leaves', data),
  getAll: () => api.get('/leaves/pending/all'), // Manager/Admin view pending
  approve: (id: string) => api.patch(`/leaves/${id}/approve`),
  reject: (id: string) => api.patch(`/leaves/${id}/reject`),
  getHistory: (workerId: string) => api.get(`/leaves/worker/${workerId}`),
};

export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/stats'),
  getAttendanceTrends: () => api.get('/analytics/attendance'),
  getProjectStatus: () => api.get('/analytics/projects'),
  getRecentActivity: () => api.get('/analytics/activity'),
  getTasksByProject: () => api.get('/analytics/tasks-by-project'),
  getMonthlyAttendance: () => api.get('/analytics/monthly-attendance'),
  getManagerStats: () => api.get('/analytics/manager-stats'),
  getKeyMetrics: () => api.get('/analytics/key-metrics'),
  getWeeklyProgress: () => api.get('/analytics/weekly-progress'),
};

export default api;
