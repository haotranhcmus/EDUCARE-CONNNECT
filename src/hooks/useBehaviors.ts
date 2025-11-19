import { behaviorService } from "@/src/services/behavior.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Get all behavior groups with aggressive caching
 * Data is cached for 24 hours and persisted locally
 */
export function useBehaviorGroups() {
  return useQuery({
    queryKey: ["behavior-groups"],
    queryFn: () => behaviorService.getBehaviorGroups(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (formerly cacheTime)
  });
}

/**
 * Get all behaviors from library with aggressive caching
 * Search is done locally on the client side
 * Data is cached for 24 hours and persisted locally
 */
export function useBehaviors() {
  return useQuery({
    queryKey: ["behaviors"],
    queryFn: () => behaviorService.getBehaviors(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}
