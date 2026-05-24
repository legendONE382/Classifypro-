import { create } from "zustand";
import { Student, StudentAttendance } from "../types/domain";
import { getSchoolStudents, getClassroomStudents, recordStudentCheckIn, recordStudentCheckOut, getTodayStudentAttendance, getWeeklyAttendanceSummary } from "../lib/student-service";

type StudentState = {
  students: Student[];
  classroomStudents: Student[];
  selectedStudent: Student | null;
  studentAttendance: StudentAttendance | null;
  weeklyAttendanceSummary: { present: number; absent: number; late: number };
  loading: boolean;
  error: string | null;

  // Actions
  fetchSchoolStudents: (schoolId: string) => Promise<void>;
  fetchClassroomStudents: (classroomId: string) => Promise<void>;
  recordStudentCheckIn: (studentId: string, schoolId: string, status: "present" | "absent" | "late") => Promise<boolean>;
  recordStudentCheckOut: (attendanceId: string) => Promise<boolean>;
  fetchTodayAttendance: (studentId: string) => Promise<void>;
  fetchWeeklyAttendance: (studentId: string) => Promise<void>;
  selectStudent: (student: Student | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useStudentStore = create<StudentState>((set: any) => ({
  students: [],
  classroomStudents: [],
  selectedStudent: null,
  studentAttendance: null,
  weeklyAttendanceSummary: { present: 0, absent: 0, late: 0 },
  loading: false,
  error: null,

  fetchSchoolStudents: async (schoolId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getSchoolStudents(schoolId);
      set({ students: data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch students";
      set({ error: message, loading: false });
    }
  },

  fetchClassroomStudents: async (classroomId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getClassroomStudents(classroomId);
      set({ classroomStudents: data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch classroom students";
      set({ error: message, loading: false });
    }
  },

  recordStudentCheckIn: async (studentId: string, schoolId: string, status: "present" | "absent" | "late") => {
    set({ loading: true, error: null });
    try {
      const result = await recordStudentCheckIn(studentId, schoolId, status);

      if (result.success) {
        set({ loading: false });
        return true;
      } else {
        set({ error: result.error, loading: false });
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record check-in";
      set({ error: message, loading: false });
      return false;
    }
  },

  recordStudentCheckOut: async (attendanceId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await recordStudentCheckOut(attendanceId);

      if (result.success) {
        set({ loading: false });
        return true;
      } else {
        set({ error: result.error, loading: false });
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record check-out";
      set({ error: message, loading: false });
      return false;
    }
  },

  fetchTodayAttendance: async (studentId: string) => {
    try {
      const data = await getTodayStudentAttendance(studentId);
      set({ studentAttendance: data });
    } catch (err) {
      console.error("Failed to fetch today's attendance:", err);
    }
  },

  fetchWeeklyAttendance: async (studentId: string) => {
    try {
      const data = await getWeeklyAttendanceSummary(studentId);
      set({ weeklyAttendanceSummary: data });
    } catch (err) {
      console.error("Failed to fetch weekly attendance:", err);
    }
  },

  selectStudent: (student: Student | null) => set({ selectedStudent: student }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
