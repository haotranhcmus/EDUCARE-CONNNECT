import type { Database } from "@/lib/supabase/database.types";
import {
  contentService,
  type ContentFilters,
} from "@/src/services/content.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ContentLibrary = Database["public"]["Tables"]["content_library"]["Row"];
type ContentLibraryInsert =
  Database["public"]["Tables"]["content_library"]["Insert"];
type ContentLibraryUpdate =
  Database["public"]["Tables"]["content_library"]["Update"];

// Query keys
export const contentKeys = {
  all: ["content"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters?: ContentFilters) =>
    [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
  ui: (filters?: ContentFilters) =>
    [...contentKeys.all, "ui", filters] as const,
};

/**
 * Fetch all content library items with aggressive caching
 * Public content library data is cached for 24 hours
 */
export function useContentLibrary(filters?: ContentFilters) {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => contentService.getContentLibrary(filters),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - public content rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Fetch content library items formatted for UI with aggressive caching
 * This replaces the CONTENT_LIBRARY mock data
 * Data is cached for 24 hours and works offline
 */
export function useContentForUI(filters?: ContentFilters) {
  return useQuery({
    queryKey: contentKeys.ui(filters),
    queryFn: () => contentService.getContentForUI(filters),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - public content rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Fetch a single content item by ID
 */
export function useContent(id: string) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => contentService.getContentById(id),
    enabled: !!id,
  });
}

/**
 * Create a new content library item
 */
export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContentLibraryInsert) =>
      contentService.createContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.ui() });
    },
  });
}

/**
 * Update a content library item
 */
export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContentLibraryUpdate }) =>
      contentService.updateContent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contentKeys.ui() });
    },
  });
}

/**
 * Delete a content library item
 */
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.ui() });
    },
  });
}

/**
 * Increment usage count for a content item
 */
export function useIncrementContentUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentService.incrementUsageCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(id) });
    },
  });
}
