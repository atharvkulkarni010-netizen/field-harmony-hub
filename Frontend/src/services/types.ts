// API Payload Types for type-safe API calls

// User related types
export interface UserRegistrationPayload {
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "WORKER";
  manager_id?: string | null;
  skills?: string[];
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: "ADMIN" | "MANAGER" | "WORKER";
  manager_id?: string | null;
  skills?: string[];
}

// Project related types
export interface ProjectCreationPayload {
  name: string;
  description?: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  assigned_manager_id: string;
  geofence_latitude?: number;
  geofence_longitude?: number;
  geofence_radius?: number;
}

export interface ProjectUpdatePayload {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: "Yet to start" | "Ongoing" | "In Review" | "Completed";
  assigned_manager_id?: string;
  geofence_latitude?: number;
  geofence_longitude?: number;
  geofence_radius?: number;
}

// Task related types
export interface TaskCreationPayload {
  title: string;
  description?: string;
  start_date?: string; // ISO date string
  due_date?: string; // ISO date string
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  status?: "Yet to start" | "Ongoing" | "In Review" | "Completed";
  rejection_reason?: string;
}

// Leave related types
export interface LeaveApplicationPayload {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  reason: string;
}

// Attendance related types
export interface CheckInPayload {
  date: string; // YYYY-MM-DD
  check_in_time: string; // HH:MM:SS
  check_in_latitude: number;
  check_in_longitude: number;
}

export interface CheckOutPayload {
  check_out_time: string; // HH:MM:SS
  check_out_latitude: number;
  check_out_longitude: number;
}

// Daily Report related types
export interface DailyReportSubmissionPayload {
  report_date: string; // YYYY-MM-DD
  description?: string;
  images?: File[];
  task_ids?: string[]; // Associated task IDs
}

// Task Assignment related types
export interface TaskAssignmentPayload {
  task_id: string;
  worker_id: string;
}

// Password related types
export interface PasswordUpdatePayload {
  newPassword: string;
}

export interface PasswordResetPayload {
  email: string;
  otp: string;
  newPassword: string;
}

// Skill related types
export interface SkillCreationPayload {
  name: string;
}
