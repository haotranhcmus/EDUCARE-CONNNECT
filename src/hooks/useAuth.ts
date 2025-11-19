import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/stores/authStore";
import { SignInData, SignUpData } from "@/src/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for signing up a new user (teacher or parent)
 */
export function useSignUp() {
  const { setUser, setProfile, setSession } = useAuthStore();

  return useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onSuccess: ({ user, profile }) => {
      setUser(user);
      setProfile(profile as any);
    },
  });
}

/**
 * Hook for signing in
 */
export function useSignIn() {
  const { setUser, setSession } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onSuccess: (data) => {
      // Clear all cached data from previous user
      queryClient.clear();

      setUser(data.user);
      setSession(data.session);
      // Fetch profile after sign in
      queryClient.invalidateQueries({ queryKey: ["profile", "current"] });
    },
  });
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const { signOut } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all cached queries on sign out
      queryClient.clear();
    },
  });
}

/**
 * Hook to get current user profile
 */
export function useCurrentProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["profile", "current"],
    queryFn: authService.getCurrentProfile,
    enabled: !!user,
  });
}

/**
 * Hook for resetting password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      authService.updatePassword(newPassword),
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setProfile } = useAuthStore();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      setProfile(data as any);
      queryClient.invalidateQueries({ queryKey: ["profile", "current"] });
    },
  });
}
