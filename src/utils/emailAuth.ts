import { supabase } from "../../lib/supabase/client";
import { AUTH_CONSTANTS } from "../constants/auth";

/**
 * Send email confirmation to user after signup
 */
export async function sendEmailConfirmation(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: AUTH_CONSTANTS.GITHUB_PAGES_URL,
    },
  });

  return { data, error };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: AUTH_CONSTANTS.GITHUB_PAGES_URL,
  });

  return { data, error };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

/**
 * Send email change confirmation
 */
export async function sendEmailChangeConfirmation(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: AUTH_CONSTANTS.GITHUB_PAGES_URL,
    }
  );

  return { data, error };
}

/**
 * Resend email confirmation
 */
export async function resendEmailConfirmation(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: AUTH_CONSTANTS.GITHUB_PAGES_URL,
    },
  });

  return { data, error };
}

/**
 * Check if user email is confirmed
 */
export async function isEmailConfirmed(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !!user?.email_confirmed_at;
}
