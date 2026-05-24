import { create } from "zustand";
import { AttendanceLog, AttendanceStatus, ClockInResponse, GeoPoint } from "../types/domain";
import { submitGeofencedAttendance } from "../lib/attendance-service";
import { isWithinGeofence } from "../lib/geofencing";

type AttendanceState = {
  todayAttendance: AttendanceLog | null;
  attendanceHistory: AttendanceLog[];
  loading: boolean;
  error: string | null;
  lastClockInResponse: ClockInResponse | null;
  
  // Actions
  clockIn: (
    teacherId: string,
    classroomId: string,
    location: GeoPoint,
    schoolLocation: GeoPoint,
    geofenceRadius: number,
    selfieUri?: string
  ) => Promise<ClockInResponse>;
  
  setTodayAttendance: (attendance: AttendanceLog | null) => void;
  setAttendanceHistory: (history: AttendanceLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useAttendanceStore = create<AttendanceState>((set: any, get: any) => ({
  todayAttendance: null,
  attendanceHistory: [],
  loading: false,
  error: null,
  lastClockInResponse: null,

  clockIn: async (
    teacherId: string,
    classroomId: string,
    location: GeoPoint,
    schoolLocation: GeoPoint,
    geofenceRadius: number,
    selfieUri?: string
  ) => {
    set({ loading: true, error: null });

    try {
      // Validate geofence locally first
      const withinGeofence = isWithinGeofence(location, schoolLocation, geofenceRadius);
      
      if (!withinGeofence) {
        const response: ClockInResponse = {
          success: false,
          message: "You are outside the school geofence. Cannot clock in.",
        };
        set({ 
          error: response.message,
          loading: false,
          lastClockInResponse: response
        });
        return response;
      }

      // Submit to server
      const response = await submitGeofencedAttendance({
        teacherId,
        classroomId,
        latitude: location.latitude,
        longitude: location.longitude,
        selfieUri,
      });

      if (response.success && response.attendanceId) {
        const newAttendance: AttendanceLog = {
          id: response.attendanceId,
          teacherId,
          classroomId,
          schoolId: "", // Will be filled from server
          status: (response.status || "on_time") as AttendanceStatus,
          clockInTime: new Date().toISOString(),
          verifiedLocation: location,
          selfieUri,
          geofenceValidated: true,
          qrValidated: false,
          createdAt: new Date().toISOString(),
        };

        set({
          todayAttendance: newAttendance,
          loading: false,
          lastClockInResponse: response,
        });
      } else {
        set({
          error: response.message,
          loading: false,
          lastClockInResponse: response,
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clock-in failed";
      const response: ClockInResponse = {
        success: false,
        message,
      };
      
      set({
        error: message,
        loading: false,
        lastClockInResponse: response,
      });

      return response;
    }
  },

  setTodayAttendance: (attendance: AttendanceLog | null) => set({ todayAttendance: attendance }),
  setAttendanceHistory: (history: AttendanceLog[]) => set({ attendanceHistory: history }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
