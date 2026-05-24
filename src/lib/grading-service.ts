import { supabase } from "./supabase";
import { Grade, ReportCard } from "../types/domain";

/**
 * Get grades for a student
 */
export const getStudentGrades = async (
  studentId: string,
  session?: string,
  term?: string
): Promise<Grade[]> => {
  try {
    let query = supabase
      .from("grades")
      .select("*")
      .eq("student_id", studentId);

    if (session) query = query.eq("session", session);
    if (term) query = query.eq("term", term);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((g: any) => ({
      id: g.id,
      studentId: g.student_id,
      classroomId: g.classroom_id,
      teacherId: g.teacher_id,
      schoolId: g.school_id,
      subject: g.subject,
      score: g.score,
      maxScore: g.max_score,
      gradeLetter: g.grade_letter,
      session: g.session,
      term: g.term,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    }));
  } catch (err) {
    console.error("Error fetching student grades:", err);
    return [];
  }
};

/**
 * Submit a grade for a student
 */
export const submitGrade = async (
  studentId: string,
  classroomId: string,
  teacherId: string,
  schoolId: string,
  subject: string,
  score: number,
  maxScore: number,
  session: string,
  term: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Calculate grade letter
    const percentage = (score / maxScore) * 100;
    const gradeLetter = calculateGradeLetter(percentage);

    const { error } = await supabase.from("grades").insert({
      student_id: studentId,
      classroom_id: classroomId,
      teacher_id: teacherId,
      school_id: schoolId,
      subject,
      score,
      max_score: maxScore,
      grade_letter: gradeLetter,
      session,
      term,
    });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit grade";
    return { success: false, error: message };
  }
};

/**
 * Get or create report card
 */
export const getStudentReportCards = async (studentId: string): Promise<ReportCard[]> => {
  try {
    const { data, error } = await supabase
      .from("report_cards")
      .select("*, grades(*)")
      .eq("student_id", studentId)
      .order("generated_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((rc: any) => ({
      id: rc.id,
      studentId: rc.student_id,
      schoolId: rc.school_id,
      session: rc.session,
      term: rc.term,
      generatedBy: rc.generated_by,
      pdfUri: rc.pdf_uri,
      generatedAt: rc.generated_at,
      createdAt: rc.created_at,
      grades: rc.grades,
    }));
  } catch (err) {
    console.error("Error fetching report cards:", err);
    return [];
  }
};

/**
 * Generate a report card for a student
 */
export const generateReportCard = async (
  studentId: string,
  schoolId: string,
  session: string,
  term: string,
  generatedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch all grades for this student in this session/term
    const grades = await getStudentGrades(studentId, session, term);

    if (grades.length === 0) {
      return { success: false, error: "No grades found for this student" };
    }

    // Calculate totals and average
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const totalMaxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
    const averagePercentage = (totalScore / totalMaxScore) * 100;
    const overallGrade = calculateGradeLetter(averagePercentage);

    // Generate PDF URI (in production, this would call a PDF generation service)
    const pdfUri = `https://storage.example.com/reports/${studentId}-${session}-${term}.pdf`;

    // Create report card record
    const { data, error } = await supabase
      .from("report_cards")
      .insert({
        student_id: studentId,
        school_id: schoolId,
        session,
        term,
        generated_by: generatedBy,
        pdf_uri: pdfUri,
        total_score: totalScore,
        total_max_score: totalMaxScore,
        average_percentage: averagePercentage,
        overall_grade: overallGrade,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate report card";
    return { success: false, error: message };
  }
};

/**
 * Calculate grade letter based on percentage
 */
export const calculateGradeLetter = (percentage: number): string => {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  if (percentage >= 50) return "E";
  return "F";
};

/**
 * Calculate GPA
 */
export const calculateGPA = (grades: Grade[]): number => {
  const gradePoints: Record<string, number> = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    E: 0.5,
    F: 0.0,
  };

  if (grades.length === 0) return 0;

  const totalPoints = grades.reduce((sum, g) => sum + (gradePoints[g.gradeLetter] || 0), 0);
  return totalPoints / grades.length;
};

/**
 * Get class average for a subject
 */
export const getClassAverageForSubject = async (
  classroomId: string,
  subject: string,
  session: string,
  term: string
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("grades")
      .select("score, max_score")
      .eq("classroom_id", classroomId)
      .eq("subject", subject)
      .eq("session", session)
      .eq("term", term);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const totalScore = data.reduce((sum: number, g: any) => sum + g.score, 0);
    const totalMaxScore = data.reduce((sum: number, g: any) => sum + g.max_score, 0);

    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  } catch (err) {
    console.error("Error calculating class average:", err);
    return 0;
  }
};

/**
 * Get student ranking in class
 */
export const getStudentRankingInClass = async (
  studentId: string,
  classroomId: string,
  session: string,
  term: string
): Promise<{ rank: number; total: number } | null> => {
  try {
    // Get student's average
    const studentGrades = await getStudentGrades(studentId, session, term);
    if (studentGrades.length === 0) return null;

    const studentAverage =
      (studentGrades.reduce((sum, g) => sum + g.score, 0) /
        studentGrades.reduce((sum, g) => sum + g.maxScore, 0)) *
      100;

    // Get all students' averages in the class
    const { data, error } = await supabase.from("grades").select("student_id, score, max_score").eq("classroom_id", classroomId).eq("session", session).eq("term", term);

    if (error) throw error;

    // Calculate averages for each student
    const studentAverages: Record<string, { totalScore: number; totalMaxScore: number }> = {};
    (data || []).forEach((grade: any) => {
      if (!studentAverages[grade.student_id]) {
        studentAverages[grade.student_id] = { totalScore: 0, totalMaxScore: 0 };
      }
      studentAverages[grade.student_id].totalScore += grade.score;
      studentAverages[grade.student_id].totalMaxScore += grade.max_score;
    });

    // Calculate rankings
    const rankings = Object.entries(studentAverages)
      .map(([id, { totalScore, totalMaxScore }]) => ({
        id,
        average: totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0,
      }))
      .sort((a, b) => b.average - a.average);

    const rank = rankings.findIndex((r) => r.id === studentId) + 1;
    const total = rankings.length;

    return { rank, total };
  } catch (err) {
    console.error("Error calculating ranking:", err);
    return null;
  }
};
