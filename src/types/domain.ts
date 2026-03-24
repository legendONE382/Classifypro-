export type UserRole = "principal" | "teacher";

export type AttendanceStatus = "on_time" | "late" | "absent";

export type ClassStatus = "teaching" | "late" | "empty";

export type Teacher = {
  id: string;
  fullName: string;
  role: UserRole;
  schoolId: string;
};

export type ClassroomStatus = {
  id: string;
  classroomName: string;
  teacherName: string;
  periodLabel: string;
  status: ClassStatus;
  updatedAt: string;
};

export type ClockInAttempt = {
  teacherId: string;
  classroomToken: string;
  latitude: number;
  longitude: number;
  selfieUri?: string;
};
