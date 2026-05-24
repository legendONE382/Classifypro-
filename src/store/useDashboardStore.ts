import { create } from "zustand";
import { ClassroomStatus, AttendanceNotification } from "../types/domain";
import { getClassroomStatusForSchool, getUnreadNotifications, markNotificationAsRead } from "../lib/attendance-service";

type DashboardState = {
  classroomStatuses: ClassroomStatus[];
  notifications: AttendanceNotification[];
  loading: boolean;
  error: string | null;
  selectedClassroom: ClassroomStatus | null;

  // Actions
  fetchClassroomStatuses: (schoolId: string) => Promise<void>;
  fetchNotifications: (principalId: string) => Promise<void>;
  refreshDashboard: (schoolId: string, principalId: string) => Promise<void>;
  selectClassroom: (classroom: ClassroomStatus | null) => void;
  markNotificationRead: (notificationId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useDashboardStore = create<DashboardState>((set: any, get: any) => ({
  classroomStatuses: [],
  notifications: [],
  loading: false,
  error: null,
  selectedClassroom: null,

  fetchClassroomStatuses: async (schoolId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getClassroomStatusForSchool(schoolId);
      const statuses: ClassroomStatus[] = data.map((item: any) => ({
        classroomId: item.classroom_id,
        classroomName: item.classroom_name,
        teacherName: item.teacher_name || "No Teacher",
        status: item.status === "teaching" ? "teaching" : item.status === "late" ? "late" : "empty",
        lastClockIn: item.last_clock_in,
        statusColor: item.status === "teaching" ? "#10b981" : item.status === "late" ? "#f59e0b" : "#ef4444",
      }));

      set({ classroomStatuses: statuses, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch classroom statuses";
      set({ error: message, loading: false });
    }
  },

  fetchNotifications: async (principalId: string) => {
    try {
      const data = await getUnreadNotifications(principalId);
      set({ notifications: data });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  },

  refreshDashboard: async (schoolId: string, principalId: string) => {
    await Promise.all([
      get().fetchClassroomStatuses(schoolId),
      get().fetchNotifications(principalId),
    ]);
  },

  selectClassroom: (classroom: ClassroomStatus | null) => set({ selectedClassroom: classroom }),

  markNotificationRead: async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      const updated = get().notifications.map((n: any) =>
        n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
      );
      set({ notifications: updated });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
