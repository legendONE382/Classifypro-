import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User, UserRole } from "../types/domain";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    schoolId: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (fullName: string, phoneNumber?: string) => Promise<boolean>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data.user) {
        // Fetch user profile from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError) {
          set({ error: "Failed to load user profile", loading: false });
          return false;
        }

        set({
          user: userData,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }

      set({ error: "Login failed", loading: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login error";
      set({ error: message, loading: false });
      return false;
    }
  },

  register: async (email, password, fullName, role, schoolId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data.user) {
        // Create user profile in users table
        const { error: userError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          school_id: schoolId,
        });

        if (userError) {
          set({ error: "Failed to create user profile", loading: false });
          return false;
        }

        set({
          user: {
            id: data.user.id,
            role,
            schoolId,
            fullName,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return true;
      }

      set({ error: "Registration failed", loading: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration error";
      set({ error: message, loading: false });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout error";
      set({ error: message, loading: false });
    }
  },

  checkAuthStatus: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userData) {
          set({ user: userData, isAuthenticated: true });
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  },

  updateProfile: async (fullName, phoneNumber) => {
    set({ loading: true, error: null });
    try {
      // Get current state
      let currentUser: User | null = null;
      const unsubscribe = useAuthStore.subscribe((state) => {
        currentUser = state.user;
      });
      unsubscribe();

      if (!currentUser) return false;

      const { error } = await supabase
        .from("users")
        .update({ full_name: fullName, phone_number: phoneNumber })
        .eq("id", currentUser.id);

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      set({
        user: { ...currentUser, fullName, phoneNumber },
        loading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      set({ error: message, loading: false });
      return false;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  clearError: () => set({ error: null }),
}));
