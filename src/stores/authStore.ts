import { authService } from "@/src/services/auth.service";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface Profile {
  id: string;
  role: "teacher" | "parent";
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  school?: string; // for teachers
  occupation?: string; // for parents
  avatar_url?: string;
  last_login_at?: string;
}

interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setSession: (session) => {
    set({ session, isAuthenticated: !!session });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  signOut: async () => {
    try {
      await authService.signOut();
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      const session = await authService.getSession();

      if (session?.user) {
        const profile = await authService.getCurrentProfile();
        set({
          user: session.user,
          profile: profile as Profile,
          session,
          isAuthenticated: true,
        });
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
