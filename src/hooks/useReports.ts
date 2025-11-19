import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import { CreateReportData, ReportFilters } from "../types/report.types";

// Query keys factory
export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters?: ReportFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to get all reports with optional filters
 */
export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportService.getReports(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get single report by ID
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a new report request
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportData) => reportService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

/**
 * Hook to delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.removeQueries({ queryKey: reportKeys.detail(id) });
    },
  });
}

/**
 * Hook to download report
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: (fileUrl: string) => reportService.downloadReport(fileUrl),
  });
}

// ============================================================================
// ANALYTICS & DASHBOARD
// ============================================================================

// Dashboard Data Types
export interface ReportsDashboardData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSessions: number;
    completedSessions: number;
    goalAchievementRate: number;
    behaviorIncidents: number;
    averageSessionRating: number;
  };
  progressTrend: Array<{
    date: string;
    achievementRate: number;
    sessionCount: number;
  }>;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    achievementRate: number;
    completedSessions: number;
  }>;
}

/**
 * Hook for Reports Dashboard - Main analytics view
 */
export function useReportsDashboard(startDate: string, endDate: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["reports", "dashboard", user?.id, startDate, endDate],
    queryFn: async (): Promise<ReportsDashboardData> => {
      // Get all completed sessions in period for teacher's students
      // Use session_logs!inner to ONLY get sessions that have logs
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select(
          `
          id,
          session_date,
          student_id,
          students!inner (
            id,
            first_name,
            last_name,
            profile_id
          ),
          session_logs!inner (
            id,
            overall_rating,
            goal_evaluations (
              achievement_level,
              status
            )
          )
        `
        )
        .eq("students.profile_id", user?.id || "")
        .eq("status", "completed")
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .is("deleted_at", null);

      if (sessionsError) throw sessionsError;

      // Get behavior incidents for teacher's students
      // Need to join through session_logs to get the session_date
      const { data: incidents, error: incidentsError } = await supabase
        .from("behavior_incidents")
        .select(
          `
          id,
          occurred_at,
          session_log:session_logs!inner (
            session:sessions!inner (
              session_date,
              student:students!inner (
                profile_id
              )
            )
          )
        `
        )
        .eq("session_log.session.student.profile_id", user?.id || "")
        .gte("session_log.session.session_date", startDate)
        .lte("session_log.session.session_date", endDate);

      if (incidentsError) {
        // Don't throw, just use empty array
      }

      // Calculate statistics
      // Since we use !inner join, all sessions have logs
      const completedSessions = sessions?.length || 0;

      let totalAchievement = 0;
      let totalRating = 0;
      let totalGoals = 0;

      const studentStats: {
        [key: string]: {
          id: string;
          name: string;
          totalAchievement: number;
          goalCount: number;
          sessionCount: number;
        };
      } = {};

      sessions?.forEach((session: any) => {
        const log = session.session_logs; // Now it's an object, not array
        const studentKey = session.student_id;

        // Initialize student stats FIRST (before processing evaluations)
        if (!studentStats[studentKey]) {
          studentStats[studentKey] = {
            id: session.student_id,
            name: `${session.students.first_name} ${session.students.last_name}`,
            totalAchievement: 0,
            goalCount: 0,
            sessionCount: 0,
          };
        }

        // Increment session count for this student
        studentStats[studentKey].sessionCount++;

        if (log?.overall_rating) {
          totalRating += log.overall_rating;
        }

        const evaluations = log?.goal_evaluations || [];
        evaluations.forEach((evaluation: any) => {
          totalAchievement += evaluation.achievement_level || 0;
          totalGoals++;

          // Add to student stats
          studentStats[studentKey].totalAchievement +=
            evaluation.achievement_level || 0;
          studentStats[studentKey].goalCount++;
        });
      });

      const avgAchievement =
        totalGoals > 0 ? Math.round(totalAchievement / totalGoals) : 0;
      const avgRating =
        completedSessions > 0 ? totalRating / completedSessions : 0;

      // Top performers
      const topPerformers = Object.values(studentStats)
        .map((student) => ({
          studentId: student.id,
          studentName: student.name,
          achievementRate:
            student.goalCount > 0
              ? Math.round(student.totalAchievement / student.goalCount)
              : 0,
          completedSessions: student.sessionCount,
        }))
        .sort((a, b) => b.achievementRate - a.achievementRate)
        .slice(0, 5);

      return {
        period: { startDate, endDate },
        summary: {
          totalSessions: completedSessions,
          completedSessions,
          goalAchievementRate: avgAchievement,
          behaviorIncidents: incidents?.length || 0,
          averageSessionRating: avgRating,
        },
        progressTrend: [],
        topPerformers,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
