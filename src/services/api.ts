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
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const usersApi = {
  getManagers: () => api.get('/users/managers'),
  getWorkers: () => api.get('/users/workers'),
  register: (data: { name: string; email: string; role: 'ADMIN' | 'MANAGER' | 'WORKER'; manager_id?: string | null }) => 
    api.post('/users/register', data),
};

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  assign: (projectId: string, managerId: string) =>
    api.post(`/projects/${projectId}/assign`, { managerId }),
};

export const tasksApi = {
  getAll: () => api.get('/tasks'),
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/tasks`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  assignWorker: (taskId: string, workerId: string) =>
    api.post(`/tasks/${taskId}/assign`, { workerId }),
};

export const attendanceApi = {
  checkIn: (location: { lat: number; lng: number }) =>
    api.post('/attendance/check-in', { location }),
  checkOut: (location: { lat: number; lng: number }) =>
    api.post('/attendance/check-out', { location }),
  getHistory: () => api.get('/attendance/history'),
  getByWorker: (workerId: string) => api.get(`/attendance/worker/${workerId}`),
};

export const reportsApi = {
  submit: (data: FormData) =>
    api.post('/reports', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/reports'),
  getByWorker: (workerId: string) => api.get(`/reports/worker/${workerId}`),
};

export const leaveApi = {
  apply: (data: any) => api.post('/leave/apply', data),
  getAll: () => api.get('/leave'),
  approve: (id: string) => api.post(`/leave/${id}/approve`),
  reject: (id: string) => api.post(`/leave/${id}/reject`),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAttendanceTrends: () => api.get('/analytics/attendance'),
  getProjectStatus: () => api.get('/analytics/projects'),
  getTaskProgress: () => api.get('/analytics/tasks'),
};

export default api;
