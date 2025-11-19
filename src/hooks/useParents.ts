import {
  parentService,
  type InviteParentRequest,
  type SendMessageRequest,
  type UpdatePermissionsRequest,
} from "@/src/services/parent.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const parentKeys = {
  all: ["parents"] as const,
  links: () => [...parentKeys.all, "links"] as const,
  linksByStudent: (studentId: string) =>
    [...parentKeys.links(), studentId] as const,
  messages: () => [...parentKeys.all, "messages"] as const,
  messagesByStudent: (studentId: string) =>
    [...parentKeys.messages(), studentId] as const,
  unreadCount: () => [...parentKeys.all, "unread-count"] as const,
};

/**
 * Hook to get parent links for a student
 */
export function useParentLinks(studentId: string) {
  return useQuery({
    queryKey: parentKeys.linksByStudent(studentId),
    queryFn: () => parentService.getParentLinks(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to invite a parent
 */
export function useInviteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InviteParentRequest) =>
      parentService.inviteParent(request),
    onSuccess: (_, variables) => {
      // Invalidate parent links for this student
      queryClient.invalidateQueries({
        queryKey: parentKeys.linksByStudent(variables.student_id),
      });
    },
  });
}

/**
 * Hook to update parent permissions
 */
export function useUpdatePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePermissionsRequest) =>
      parentService.updatePermissions(request),
    onSuccess: () => {
      // Invalidate all parent links
      queryClient.invalidateQueries({
        queryKey: parentKeys.links(),
      });
    },
  });
}

/**
 * Hook to revoke parent access
 */
export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, reason }: { linkId: string; reason?: string }) =>
      parentService.revokeAccess(linkId, reason),
    onSuccess: () => {
      // Invalidate all parent links
      queryClient.invalidateQueries({
        queryKey: parentKeys.links(),
      });
    },
  });
}

/**
 * Hook to reactivate a parent link
 */
export function useReactivateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => parentService.reactivateLink(linkId),
    onSuccess: () => {
      // Invalidate all parent links
      queryClient.invalidateQueries({
        queryKey: parentKeys.links(),
      });
    },
  });
}

/**
 * Hook to delete a parent link
 */
export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => parentService.deleteLink(linkId),
    onSuccess: () => {
      // Invalidate all parent links
      queryClient.invalidateQueries({
        queryKey: parentKeys.links(),
      });
    },
  });
}

/**
 * Hook to get messages for a student
 */
export function useParentMessages(studentId: string) {
  return useQuery({
    queryKey: parentKeys.messagesByStudent(studentId),
    queryFn: () => parentService.getMessages(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 30, // 30 seconds - messages need fresher data
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) =>
      parentService.sendMessage(request),
    onSuccess: (_, variables) => {
      // Invalidate messages for this student
      queryClient.invalidateQueries({
        queryKey: parentKeys.messagesByStudent(variables.student_id),
      });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: parentKeys.unreadCount(),
      });
    },
  });
}

/**
 * Hook to mark a message as read
 */
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      parentService.markMessageAsRead(messageId),
    onSuccess: () => {
      // Invalidate all messages
      queryClient.invalidateQueries({
        queryKey: parentKeys.messages(),
      });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: parentKeys.unreadCount(),
      });
    },
  });
}

/**
 * Hook to get unread message count
 */
export function useUnreadMessageCount() {
  return useQuery({
    queryKey: parentKeys.unreadCount(),
    queryFn: () => parentService.getUnreadCount(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Hook for parent to get their own permissions for a student
 */
export function useMyPermissions(studentId: string) {
  return useQuery({
    queryKey: ["parent-permissions", studentId],
    queryFn: () => parentService.getMyPermissions(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for parent to get all their students with permissions
 */
export function useMyStudents() {
  return useQuery({
    queryKey: ["my-students"],
    queryFn: () => {
      return parentService.getMyStudents();
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
