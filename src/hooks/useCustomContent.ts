import {
  CustomContentFilters,
  UserCustomContentInsert,
  userCustomContentService,
} from "@/src/services/userCustomContent.service";
import { useAuthStore } from "@/src/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query keys for custom content
 */
export const customContentKeys = {
  all: ["custom-content"] as const,
  lists: () => [...customContentKeys.all, "list"] as const,
  list: (userId: string, filters?: CustomContentFilters) =>
    [...customContentKeys.lists(), userId, filters] as const,
  details: () => [...customContentKeys.all, "detail"] as const,
  detail: (id: string) => [...customContentKeys.details(), id] as const,
};

/**
 * Get user's custom content with caching
 */
export function useMyCustomContent(filters?: CustomContentFilters) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: customContentKeys.list(user?.id || "", filters),
    queryFn: () =>
      userCustomContentService.getMyCustomContent(user!.id, filters),
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get single custom content by ID
 */
export function useCustomContentById(id: string) {
  return useQuery({
    queryKey: customContentKeys.detail(id),
    queryFn: () => userCustomContentService.getCustomContentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Create new custom content
 */
export function useCreateCustomContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<UserCustomContentInsert, "id" | "created_at" | "updated_at">
    ) => userCustomContentService.createCustomContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
    },
  });
}

/**
 * Update custom content
 */
export function useUpdateCustomContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UserCustomContentInsert>;
    }) => userCustomContentService.updateCustomContent(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customContentKeys.detail(id) });
    },
  });
}

/**
 * Delete custom content (soft delete)
 */
export function useDeleteCustomContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      userCustomContentService.deleteCustomContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
    },
  });
}

/**
 * Toggle favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      userCustomContentService.toggleFavorite(id, isFavorite),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customContentKeys.detail(id) });
    },
  });
}

/**
 * Increment usage count
 */
export function useIncrementCustomContentUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userCustomContentService.incrementUsage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customContentKeys.detail(id) });
    },
  });
}

/**
 * Duplicate custom content
 */
export function useDuplicateCustomContent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) =>
      userCustomContentService.duplicateContent(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customContentKeys.lists() });
    },
  });
}
