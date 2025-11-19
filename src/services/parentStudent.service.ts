import { supabase } from "@/lib/supabase/client";
import {
  DomainProgress,
  SessionDetailData,
  SessionFilters,
  SessionWithLog,
  Student,
  StudentStats,
} from "@/src/types/student";

/**
 * Student Service for Parent App
 */
class ParentStudentService {
  /**
   * Get student basic info
   */
  async getStudentInfo(studentId: string): Promise<Student> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) throw new Error(error.message);
    return data as Student;
  }

  /**
   * Get student sessions with filters
   */
  async getStudentSessions(
    studentId: string,
    filters?: SessionFilters
  ): Promise<SessionWithLog[]> {
    let query = supabase
      .from("sessions")
      .select("*, session_log:session_logs(*)")
      .eq("student_id", studentId)
      .is("deleted_at", null)
      .order("session_date", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      // Map status: upcoming -> scheduled (not cancelled or completed)
      if (filters.status === "upcoming") {
        query = query.eq("status", "scheduled");
      } else {
        query = query.eq("status", filters.status);
      }
    }
    if (filters?.dateFrom) query = query.gte("session_date", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("session_date", filters.dateTo);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as SessionWithLog[];
  }

  /**
   * Get session detail
   */
  async getSessionDetail(sessionId: string): Promise<SessionDetailData> {
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*, session_log:session_logs(*)")
      .eq("id", sessionId)
      .single();

    if (error) throw new Error(error.message);
    return {
      session: session as any,
      session_log: (session.session_log || undefined) as any,
      contents: [],
      media: [],
    };
  }

  /**
   * Get student statistics
   */
  async getStudentStats(studentId: string): Promise<StudentStats> {
    const { data: sessions } = await supabase
      .from("sessions")
      .select("*, session_log:session_logs(*)")
      .eq("student_id", studentId)
      .is("deleted_at", null);

    const totalSessions = sessions?.length || 0;
    const completedSessions =
      sessions?.filter((s) => s.status === "completed").length || 0;
    const upcomingSessions =
      sessions?.filter((s) => s.status === "scheduled").length || 0;
    const cancelledSessions =
      sessions?.filter((s) => s.status === "cancelled").length || 0;
    const progressPercent =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      cancelledSessions,
      avgRating: null,
      progressPercent,
      lastSessionDate: null,
      domains: { cognitive: 0, motor: 0, language: 0, social: 0, self_care: 0 },
    };
  }

  /**
   * Get goal progress (placeholder)
   */
  async getStudentGoalProgress(studentId: string): Promise<DomainProgress> {
    return {
      cognitive: {
        domain: "cognitive",
        totalGoals: 0,
        achievedGoals: 0,
        partiallyAchievedGoals: 0,
        notAchievedGoals: 0,
        progressPercent: 0,
        recentEvaluations: [],
      },
      motor: {
        domain: "motor",
        totalGoals: 0,
        achievedGoals: 0,
        partiallyAchievedGoals: 0,
        notAchievedGoals: 0,
        progressPercent: 0,
        recentEvaluations: [],
      },
      language: {
        domain: "language",
        totalGoals: 0,
        achievedGoals: 0,
        partiallyAchievedGoals: 0,
        notAchievedGoals: 0,
        progressPercent: 0,
        recentEvaluations: [],
      },
      social: {
        domain: "social",
        totalGoals: 0,
        achievedGoals: 0,
        partiallyAchievedGoals: 0,
        notAchievedGoals: 0,
        progressPercent: 0,
        recentEvaluations: [],
      },
      self_care: {
        domain: "self_care",
        totalGoals: 0,
        achievedGoals: 0,
        partiallyAchievedGoals: 0,
        notAchievedGoals: 0,
        progressPercent: 0,
        recentEvaluations: [],
      },
    };
  }
}

export const parentStudentService = new ParentStudentService();
