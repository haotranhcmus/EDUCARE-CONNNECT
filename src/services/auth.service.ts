import { supabase } from "@/lib/supabase/client";
import {
  ParentSignUpData,
  SignInData,
  SignUpData,
  TeacherSignUpData,
} from "@/src/types";

export const authService = {
  /**
   * Sign up a new user (teacher or parent)
   */
  async signUp(data: SignUpData) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        },
        emailRedirectTo: undefined, // Prevent auto-confirmation in development
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    try {
      // 2. Create profile (chỉ cần 1 bảng profiles!)

      const profileData: any = {
        id: authData.user.id,
        role: data.role,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      };

      // Add role-specific fields
      if (data.role === "teacher") {
        const teacherData = data as TeacherSignUpData;
        profileData.school = teacherData.school;
      } else if (data.role === "parent") {
        const parentData = data as ParentSignUpData;
        profileData.occupation = parentData.occupation;
        profileData.relationship_to_student =
          parentData.relationship_to_student;
        profileData.emergency_contact = parentData.emergency_contact;
        profileData.address = parentData.address;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      return { user: authData.user, profile };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // Check if email is verified
    if (authData.user && !authData.user.email_confirmed_at) {
      // Sign out immediately
      await supabase.auth.signOut();

      // Throw specific error for unverified email
      const unverifiedError = new Error("EMAIL_NOT_VERIFIED");
      (unverifiedError as any).email = data.email;
      throw unverifiedError;
    }

    // Update last login and auto-activate parent links if needed
    if (authData.user) {
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() } as any)
        .eq("id", authData.user.id);

      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      // Auto-activate student_parent links for parents on login
      if (profile?.role === "parent") {
        const { data: links, error: activateError } = await supabase
          .from("student_parents")
          .update({
            status: "active",
            activated_at: new Date().toISOString(),
          })
          .eq("parent_id", authData.user.id)
          .eq("status", "invited")
          .select();

        if (!activateError && links && links.length > 0) {
          // Successfully activated
        }
      }
    }

    return authData;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user profile
   */
  async getCurrentProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "educareconnect://reset-password",
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;

    // Check if user is a parent
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "parent") {
      // Activate any 'invited' student_parent links for this parent
      const { data: links, error: activateError } = await supabase
        .from("student_parents")
        .update({
          status: "active",
          activated_at: new Date().toISOString(),
        })
        .eq("parent_id", user.id)
        .eq("status", "invited")
        .select();

      if (!activateError && links && links.length > 0) {
        // Successfully activated
      }
    }
  },
};
