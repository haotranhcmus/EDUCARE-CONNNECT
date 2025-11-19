import { authService } from "@/src/services/auth.service";
import { profileService } from "@/src/services/profile.service";
import { UpdateProfileData } from "@/src/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hooks for Parent App - Profile management
 */

/**
 * Hook to get current parent profile
 */
export function useParentProfile() {
  return useQuery({
    queryKey: ["parent-profile"],
    queryFn: () => profileService.getParentProfile(),
    staleTime: 1000 * 60 * 10, // 10 minutes - profile doesn't change often
    retry: 1,
  });
}

/**
 * Hook to update parent profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateProfileData) =>
      profileService.updateParentProfile(updates),
    onSuccess: (data) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
    },
    onError: (error) => {
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileUri,
      fileName,
    }: {
      fileUri: string;
      fileName: string;
    }) => profileService.uploadAvatar(fileUri, fileName),
    onSuccess: (data: any) => {
      // Invalidate profile to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
    },
    onError: (error) => {
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
    },
    onError: (error) => {
    },
  });
}

/**
 * Hook to change password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      authService.updatePassword(newPassword),
    onSuccess: () => {
    },
    onError: (error) => {
    },
  });
}
