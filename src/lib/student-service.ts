import { supabase } from "./supabase";
import { Student, StudentAttendance } from "../types/domain";

/**
 * Get all students in a school
 */
export const getSchoolStudents = async (schoolId: string): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((s: any) => ({
      id: s.id,
      schoolId: s.school_id,
      fullName: s.full_name,
      admissionNumber: s.admission_number,
      gradeLevel: s.grade_level,
      parentPhoneNumber: s.parent_phone_number,
      enrollmentDate: s.enrollment_date,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  } catch (err) {
    console.error("Error fetching school students:", err);
    return [];
  }
};

/**
 * Get students in a specific classroom
 */
export const getClassroomStudents = async (classroomId: string): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from("student_enrollments")
      .select("students (*)")
      .eq("classroom_id", classroomId);

    if (error) throw error;

    return (data || []).map((enrollment: any) => enrollment.students);
  } catch (err) {
    console.error("Error fetching classroom students:", err);
    return [];
  }
};

/**
 * Record student check-in
 */
export const recordStudentCheckIn = async (
  studentId: string,
  schoolId: string,
  status: "present" | "absent" | "late"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if attendance record already exists for today
    const { data: existing, error: fetchError } = await supabase
      .from("student_attendance")
      .select("*")
      .eq("student_id", studentId)
      .eq("date_recorded", today)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("student_attendance")
        .update({
          status,
          check_in_time: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Create new attendance record
      const { error } = await supabase.from("student_attendance").insert({
        student_id: studentId,
        school_id: schoolId,
        status,
        check_in_time: new Date().toISOString(),
        date_recorded: today,
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record check-in";
    return { success: false, error: message };
  }
};

/**
 * Record student check-out
 */
export const recordStudentCheckOut = async (
  attendanceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("student_attendance")
      .update({
        check_out_time: new Date().toISOString(),
      })
      .eq("id", attendanceId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record check-out";
    return { success: false, error: message };
  }
};

/**
 * Get today's attendance for a student
 */
export const getTodayStudentAttendance = async (
  studentId: string
): Promise<StudentAttendance | null> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("student_attendance")
      .select("*")
      .eq("student_id", studentId)
      .eq("date_recorded", today)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      studentId: data.student_id,
      schoolId: data.school_id,
      checkInTime: data.check_in_time,
      checkOutTime: data.check_out_time,
      status: data.status,
      dateRecorded: data.date_recorded,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Error fetching today's attendance:", err);
    return null;
  }
};

/**
 * Get weekly attendance summary for a student
 */
export const getWeeklyAttendanceSummary = async (
  studentId: string
): Promise<{ present: number; absent: number; late: number }> => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("student_attendance")
      .select("status")
      .eq("student_id", studentId)
      .gte("date_recorded", sevenDaysAgo.toISOString().split("T")[0])
      .lte("date_recorded", today.toISOString().split("T")[0]);

    if (error) throw error;

    const summary = { present: 0, absent: 0, late: 0 };

    (data || []).forEach((record: any) => {
      if (record.status === "present") summary.present++;
      else if (record.status === "absent") summary.absent++;
      else if (record.status === "late") summary.late++;
    });

    return summary;
  } catch (err) {
    console.error("Error fetching weekly summary:", err);
    return { present: 0, absent: 0, late: 0 };
  }
};

/**
 * Get monthly attendance history
 */
export const getMonthlyStudentAttendance = async (
  studentId: string,
  month: number,
  year: number
): Promise<StudentAttendance[]> => {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("student_attendance")
      .select("*")
      .eq("student_id", studentId)
      .gte("date_recorded", startDate)
      .lte("date_recorded", endDate);

    if (error) throw error;

    return (data || []).map((a: any) => ({
      id: a.id,
      studentId: a.student_id,
      schoolId: a.school_id,
      checkInTime: a.check_in_time,
      checkOutTime: a.check_out_time,
      status: a.status,
      dateRecorded: a.date_recorded,
      createdAt: a.created_at,
    }));
  } catch (err) {
    console.error("Error fetching monthly attendance:", err);
    return [];
  }
};

/**
 * Get parents of students for notifications
 */
export const getStudentParents = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from("student_parents")
      .select("*, users(*)")
      .eq("student_id", studentId);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Error fetching student parents:", err);
    return [];
  }
};

/**
 * Notify parent of student's attendance status
 */
export const notifyParentOfAttendance = async (
  studentId: string,
  eventType: "arrived" | "departed" | "late" | "absent",
  message: string
): Promise<boolean> => {
  try {
    const parents = await getStudentParents(studentId);

    for (const parent of parents) {
      if (parent.users?.phoneNumber) {
        const { error } = await supabase.from("notifications").insert({
          user_id: parent.users.id,
          event_type: eventType,
          message,
          related_student_id: studentId,
        });

        if (error) console.error("Error creating notification:", error);
      }
    }

    return true;
  } catch (err) {
    console.error("Error notifying parent:", err);
    return false;
  }
};
