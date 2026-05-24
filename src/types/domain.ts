// ============================================
// User & Authentication Types
// ============================================
export type UserRole = "principal" | "teacher" | "parent" | "admin";

export type User = {
  id: string;
  role: UserRole;
  schoolId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// School Types
// ============================================
export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type School = {
  id: string;
  name: string;
  location: GeoPoint;
  geofenceRadiusMeters: number;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// Classroom Types
// ============================================
export type Classroom = {
  id: string;
  schoolId: string;
  name: string;
  classCode: string;
  qrToken: string;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
};

export type Teacher = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  schoolId: string;
  phoneNumber?: string;
  classrooms?: Classroom[];
};

// ============================================
// Attendance Types
// ============================================
export type AttendanceStatus = "on_time" | "late" | "absent";

export type AttendanceLog = {
  id: string;
  teacherId: string;
  classroomId: string;
  schoolId: string;
  status: AttendanceStatus;
  clockInTime: string;
  verifiedLocation: GeoPoint;
  selfieUri?: string;
  geofenceValidated: boolean;
  qrValidated: boolean;
  createdAt: string;
};

export type ClockInAttempt = {
  teacherId: string;
  classroomId: string;
  latitude: number;
  longitude: number;
  selfieUri?: string;
};

export type ClockInResponse = {
  success: boolean;
  message: string;
  attendanceId?: string;
  status?: AttendanceStatus;
};

// ============================================
// Dashboard Types
// ============================================
export type ClassStatus = "teaching" | "late" | "empty";

export type ClassroomStatus = {
  classroomId: string;
  classroomName: string;
  teacherName: string;
  status: ClassStatus;
  lastClockIn?: string;
  teacherId?: string;
  statusColor?: string;
};

export type AttendanceNotification = {
  id: string;
  teacherId: string;
  principalId: string;
  schoolId: string;
  eventType: "late_arrival" | "absent" | "on_time";
  message: string;
  readAt?: string;
  createdAt: string;
};

// ============================================
// Grading & Student Types
// ============================================
export type Student = {
  id: string;
  schoolId: string;
  fullName: string;
  admissionNumber: string;
  gradeLevel: string;
  parentPhoneNumber?: string;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Grade = {
  id: string;
  studentId: string;
  classroomId: string;
  teacherId: string;
  schoolId: string;
  subject: string;
  score: number;
  maxScore: number;
  gradeLetter: string;
  session: string;
  term: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportCard = {
  id: string;
  studentId: string;
  schoolId: string;
  session: string;
  term: string;
  generatedBy: string;
  pdfUri?: string;
  generatedAt: string;
  createdAt: string;
  grades?: Grade[];
};

// ============================================
// Student Attendance Types
// ============================================
export type StudentAttendance = {
  id: string;
  studentId: string;
  schoolId: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late";
  dateRecorded: string;
  createdAt: string;
};

// ============================================
// Helper Types for Old API (backward compatibility)
// ============================================
export type PeriodLabel = string;

export type classroomStatusBackCompat = {
  id: string;
  classroomName: string;
  teacherName: string;
  periodLabel: PeriodLabel;
  status: ClassStatus;
  updatedAt: string;
};

// ============================================
// API Response Types
// ============================================
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  error: string | null;
  success: boolean;
};
