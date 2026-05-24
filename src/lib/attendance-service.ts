// Attendance service functions interacting with Supabase
import { supabase } from "./supabase";
import { ClockInAttempt, ClockInResponse, AttendanceLog } from "../types/domain";

/**
 * Submit geofenced attendance
 */
export const submitGeofencedAttendance = async (
  attempt: ClockInAttempt
): Promise<ClockInResponse> => {
  try {
    const { data, error } = await supabase.rpc("validate_geofenced_attendance", {
      p_teacher_id: attempt.teacherId,
      p_classroom_id: attempt.classroomId || "",
      p_latitude: attempt.latitude,
      p_longitude: attempt.longitude,
      p_selfie_uri: attempt.selfieUri || null,
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Attendance submission failed",
      };
    }

    return {
      success: data.success,
      message: data.message,
      attendanceId: data.attendance_id,
      status: data.message?.includes("late") ? "late" : "on_time",
    };
  } catch (err) {
    return {
      success: false,
      message: "Error: " + (err instanceof Error ? err.message : "Unknown error"),
    };
  }
};

/**
 * Get today's attendance for a teacher
 */
export const getTodayAttendance = async (teacherId: string): Promise<AttendanceLog[]> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("teacher_id", teacherId)
      .gte("clock_in_time", `${today}T00:00:00`)
      .lt("clock_in_time", `${today}T23:59:59`);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Error fetching today's attendance:", err);
    return [];
  }
};

/**
 * Get monthly attendance summary
 */
export const getMonthlyAttendanceSummary = async (
  teacherId: string,
  month: number,
  year: number
): Promise<{ onTime: number; late: number; absent: number }> => {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

    const { data, error } = await supabase
      .from("attendance_logs")
      .select("status")
      .eq("teacher_id", teacherId)
      .gte("clock_in_time", startDate)
      .lte("clock_in_time", endDate);

    if (error) throw error;

    const summary = {
      onTime: 0,
      late: 0,
      absent: 0,
    };

    data?.forEach((record: any) => {
      if (record.status === "on_time") summary.onTime++;
      else if (record.status === "late") summary.late++;
      else if (record.status === "absent") summary.absent++;
    });

    return summary;
  } catch (err) {
    console.error("Error fetching monthly summary:", err);
    return { onTime: 0, late: 0, absent: 0 };
  }
};

/**
 * Get classroom status for dashboard
 */
export const getClassroomStatusForSchool = async (schoolId: string) => {
  try {
    const { data, error } = await supabase.rpc("get_daily_classroom_status", {
      p_school_id: schoolId,
    });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Error fetching classroom status:", err);
    return [];
  }
};

/**
 * Create attendance notification
 */
export const createAttendanceNotification = async (
  teacherId: string,
  principalId: string,
  schoolId: string,
  eventType: "late_arrival" | "absent" | "on_time",
  message: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("attendance_notifications")
      .insert({
        teacher_id: teacherId,
        principal_id: principalId,
        school_id: schoolId,
        event_type: eventType,
        message,
      });

    return !error;
  } catch (err) {
    console.error("Error creating notification:", err);
    return false;
  }
};

/**
 * Get unread notifications for principal
 */
export const getUnreadNotifications = async (principalId: string) => {
  try {
    const { data, error } = await supabase
      .from("attendance_notifications")
      .select("*")
      .eq("principal_id", principalId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("attendance_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    return !error;
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return false;
  }
};
