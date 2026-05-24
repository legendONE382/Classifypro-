import { create } from "zustand";
import { Grade, ReportCard, Student } from "../types/domain";
import { getStudentGrades, submitGrade, getStudentReportCards, generateReportCard } from "../lib/grading-service";

type GradingState = {
  grades: Grade[];
  reportCards: ReportCard[];
  selectedStudent: Student | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchStudentGrades: (studentId: string, session?: string, term?: string) => Promise<void>;
  fetchReportCards: (studentId: string) => Promise<void>;
  submitGrade: (
    studentId: string,
    classroomId: string,
    teacherId: string,
    schoolId: string,
    subject: string,
    score: number,
    maxScore: number,
    session: string,
    term: string
  ) => Promise<boolean>;
  generateReportCard: (
    studentId: string,
    schoolId: string,
    session: string,
    term: string,
    generatedBy: string
  ) => Promise<boolean>;
  setSelectedStudent: (student: Student | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useGradingStore = create<GradingState>((set: any) => ({
  grades: [],
  reportCards: [],
  selectedStudent: null,
  loading: false,
  error: null,

  fetchStudentGrades: async (studentId: string, session?: string, term?: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getStudentGrades(studentId, session, term);
      set({ grades: data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch grades";
      set({ error: message, loading: false });
    }
  },

  fetchReportCards: async (studentId: string) => {
    try {
      const data = await getStudentReportCards(studentId);
      set({ reportCards: data });
    } catch (err) {
      console.error("Failed to fetch report cards:", err);
    }
  },

  submitGrade: async (
    studentId: string,
    classroomId: string,
    teacherId: string,
    schoolId: string,
    subject: string,
    score: number,
    maxScore: number,
    session: string,
    term: string
  ) => {
    set({ loading: true, error: null });
    try {
      const result = await submitGrade(
        studentId,
        classroomId,
        teacherId,
        schoolId,
        subject,
        score,
        maxScore,
        session,
        term
      );

      if (result.success) {
        set({ loading: false });
        return true;
      } else {
        set({ error: result.error, loading: false });
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit grade";
      set({ error: message, loading: false });
      return false;
    }
  },

  generateReportCard: async (
    studentId: string,
    schoolId: string,
    session: string,
    term: string,
    generatedBy: string
  ) => {
    set({ loading: true, error: null });
    try {
      const result = await generateReportCard(studentId, schoolId, session, term, generatedBy);

      if (result.success) {
        set({ loading: false });
        return true;
      } else {
        set({ error: result.error, loading: false });
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate report card";
      set({ error: message, loading: false });
      return false;
    }
  },

  setSelectedStudent: (student: Student | null) => set({ selectedStudent: student }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
