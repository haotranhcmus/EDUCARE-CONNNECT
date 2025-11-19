import { parentStudentService } from "@/src/services/parentStudent.service";
import { SessionFilters } from "@/src/types/student";
import { useQuery } from "@tanstack/react-query";

/**
 * Hooks for Parent App - Student data
 */

/**
 * Hook to get student basic info
 */
export function useStudentInfo(studentId: string) {
  return useQuery({
    queryKey: ["student-info", studentId],
    queryFn: () => parentStudentService.getStudentInfo(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get student sessions
 */
export function useStudentSessions(
  studentId: string,
  filters?: SessionFilters
) {
  return useQuery({
    queryKey: ["student-sessions", studentId, filters],
    queryFn: () => parentStudentService.getStudentSessions(studentId, filters),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes - sessions update frequently
  });
}

/**
 * Hook to get session detail
 */
export function useSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ["session-detail", sessionId],
    queryFn: () => parentStudentService.getSessionDetail(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get student stats
 */
export function useStudentStats(studentId: string) {
  return useQuery({
    queryKey: ["student-stats", studentId],
    queryFn: () => parentStudentService.getStudentStats(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get student goal progress by domain
 */
export function useStudentGoalProgress(studentId: string) {
  return useQuery({
    queryKey: ["student-goal-progress", studentId],
    queryFn: () => parentStudentService.getStudentGoalProgress(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes - progress doesn't change often
  });
}

/**
 * Hook to get upcoming sessions for a student (next 7 days)
 */
export function useUpcomingSessions(studentId: string) {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return useQuery({
    queryKey: ["upcoming-sessions", studentId],
    queryFn: () =>
      parentStudentService.getStudentSessions(studentId, {
        status: "upcoming",
        dateFrom: today,
        dateTo: nextWeek,
        limit: 10,
      }),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get recent completed sessions
 */
export function useRecentSessions(studentId: string, limit: number = 5) {
  return useQuery({
    queryKey: ["recent-sessions", studentId, limit],
    queryFn: () =>
      parentStudentService.getStudentSessions(studentId, {
        status: "completed",
        limit,
      }),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
