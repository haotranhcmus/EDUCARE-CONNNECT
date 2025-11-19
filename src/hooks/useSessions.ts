import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { sessionService } from "../services/session.service";
import {
  BehaviorIncidentData,
  CreateSessionData,
  GoalEvaluationData,
  SessionContentData,
  SessionFilters,
  SessionLogData,
  SessionWithDetails,
  UpdateSessionData,
} from "../types/session.types";

// Query keys factory
export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (filters?: SessionFilters) =>
    [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  calendar: (start: string, end: string, studentId?: string) =>
    [...sessionKeys.all, "calendar", start, end, studentId] as const,
  logs: () => [...sessionKeys.all, "logs"] as const,
  log: (sessionId: string) => [...sessionKeys.logs(), sessionId] as const,
  contents: (sessionId: string) =>
    [...sessionKeys.all, "contents", sessionId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get sessions with optional filters
 */
export function useSessions(
  filters?: SessionFilters,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => sessionService.getSessions(filters),
    ...options,
  });
}

/**
 * Get single session by ID with full details
 */
export function useSession(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionService.getSession(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get sessions for calendar view (within date range)
 */
export function useCalendarSessions(
  startDate: string,
  endDate: string,
  studentId?: string,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sessionKeys.calendar(startDate, endDate, studentId),
    queryFn: () =>
      sessionService.getCalendarSessions(startDate, endDate, studentId),
    ...options,
  });
}

/**
 * Get session log by session ID
 */
export function useSessionLog(
  sessionId: string,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sessionKeys.log(sessionId),
    queryFn: () => sessionService.getSessionLog(sessionId),
    enabled: !!sessionId,
    ...options,
  });
}

// ============================================================================
// MUTATIONS - Session CRUD
// ============================================================================

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionData) => sessionService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

/**
 * Update an existing session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionData }) =>
      sessionService.updateSession(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

/**
 * Cancel a session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      sessionService.cancelSession(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

/**
 * Delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionService.deleteSession(id),
    onSuccess: (_, id) => {
      // Remove the specific session from cache immediately
      queryClient.removeQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.removeQueries({ queryKey: sessionKeys.contents(id) });
      queryClient.removeQueries({ queryKey: sessionKeys.log(id) });

      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });

      // Force refetch all sessions queries
      queryClient.refetchQueries({ queryKey: sessionKeys.lists() });
      queryClient.refetchQueries({ queryKey: sessionKeys.all });
    },
  });
}

// ============================================================================
// MUTATIONS - Session Content
// ============================================================================

/**
 * Get session contents with goals
 */
export function useSessionContents(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.contents(sessionId),
    queryFn: () => sessionService.getSessionContents(sessionId),
    enabled: !!sessionId,
  });
}

/**
 * Add content to a session
 */
export function useAddContentToSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SessionContentData) =>
      sessionService.addContentToSession(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(variables.session_id),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.contents(variables.session_id),
      });
    },
  });
}

/**
 * Update content order in a session
 */
export function useUpdateContentOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Array<{ id: string; order_index: number }>;
    }) => sessionService.updateContentOrder(sessionId, updates),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

/**
 * Remove content from a session
 */
export function useRemoveContentFromSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      sessionId,
    }: {
      contentId: string;
      sessionId: string;
    }) => sessionService.removeContentFromSession(contentId),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.contents(sessionId),
      });
    },
  });
}

/**
 * Update content goals
 */
export function useUpdateContentGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      goals,
      sessionId,
    }: {
      contentId: string;
      goals: string[];
      sessionId: string;
    }) => sessionService.updateContentGoals(contentId, goals),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.contents(sessionId),
      });
    },
  });
}

// ============================================================================
// MUTATIONS - Session Logging
// ============================================================================

/**
 * Start a session (create session log)
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      createdBy,
    }: {
      sessionId: string;
      createdBy: string;
    }) => sessionService.startSession(sessionId, createdBy),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.log(sessionId) });
    },
  });
}

/**
 * Update session log during the session
 */
export function useUpdateSessionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: Partial<SessionLogData>;
    }) => sessionService.updateSessionLog(sessionId, data),
    onSuccess: async (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.log(sessionId) });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });

      // Get session to invalidate student queries
      const session = queryClient.getQueryData<SessionWithDetails>(
        sessionKeys.detail(sessionId)
      );
      if (session?.student_id) {
        queryClient.invalidateQueries({
          queryKey: ["students", "detail", session.student_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", session.student_id, "sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", "list"],
        });
      }
    },
  });
}

/**
 * Complete a session
 */
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      sessionService.completeSession(sessionId),
    onSuccess: async (_, sessionId) => {
      // Invalidate session queries
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.log(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all }); // Added for calendar

      // Get session to find student_id and invalidate student stats
      const session = queryClient.getQueryData<SessionWithDetails>(
        sessionKeys.detail(sessionId)
      );
      if (session?.student_id) {
        // Invalidate student detail to refresh stats (completed_sessions, etc.)
        queryClient.invalidateQueries({
          queryKey: ["students", "detail", session.student_id],
        });
        // Invalidate student sessions list
        queryClient.invalidateQueries({
          queryKey: ["students", session.student_id, "sessions"],
        });
        // Invalidate ALL students lists to refresh student cards
        queryClient.invalidateQueries({
          queryKey: ["students", "list"],
        });
      }
    },
  });
}

/**
 * Delete a session log and all related data
 */
export function useDeleteSessionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      sessionService.deleteSessionLog(sessionId),
    onSuccess: async (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.log(sessionId) });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });

      // Get session to invalidate student queries
      const session = queryClient.getQueryData<SessionWithDetails>(
        sessionKeys.detail(sessionId)
      );
      if (session?.student_id) {
        queryClient.invalidateQueries({
          queryKey: ["students", "detail", session.student_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", session.student_id, "sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", "list"],
        });
      }
    },
  });
}

/**
 * Reset session log to allow re-evaluation
 */
export function useResetSessionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      sessionService.resetSessionLog(sessionId),
    onSuccess: async (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.log(sessionId) });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });

      // Get session to invalidate student queries
      const session = queryClient.getQueryData<SessionWithDetails>(
        sessionKeys.detail(sessionId)
      );
      if (session?.student_id) {
        queryClient.invalidateQueries({
          queryKey: ["students", "detail", session.student_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", session.student_id, "sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["students", "list"],
        });
      }
    },
  });
}

// ============================================================================
// MUTATIONS - Behavior Incidents
// ============================================================================

/**
 * Add a behavior incident to session log
 */
export function useAddBehaviorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BehaviorIncidentData) =>
      sessionService.addBehaviorIncident(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.log(variables.session_log_id),
      });
    },
  });
}

/**
 * Update a behavior incident
 */
export function useUpdateBehaviorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BehaviorIncidentData>;
    }) => sessionService.updateBehaviorIncident(id, data),
    onSuccess: () => {
      // Invalidate all logs since we don't know which log this belongs to
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}

/**
 * Delete a behavior incident
 */
export function useDeleteBehaviorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionService.deleteBehaviorIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}

// ============================================================================
// MUTATIONS - Goal Evaluations
// ============================================================================

/**
 * Add a goal evaluation to session content
 */
export function useAddGoalEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoalEvaluationData) =>
      sessionService.addGoalEvaluation(data),
    onSuccess: () => {
      // Invalidate all session details and logs
      queryClient.invalidateQueries({ queryKey: sessionKeys.details() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}

/**
 * Update a goal evaluation
 */
export function useUpdateGoalEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<GoalEvaluationData>;
    }) => sessionService.updateGoalEvaluation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.details() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}

// ============================================================================
// MUTATIONS - Media Upload
// ============================================================================

/**
 * Upload media to session log
 */
export function useUploadSessionMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionLogId,
      file,
      uploadedBy,
    }: {
      sessionLogId: string;
      file: File;
      uploadedBy: string;
    }) => sessionService.uploadMedia(sessionLogId, file, uploadedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}

/**
 * Delete media from session log
 */
export function useDeleteSessionMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      sessionService.deleteMedia(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.logs() });
    },
  });
}
