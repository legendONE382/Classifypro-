import { create } from "zustand";

import type { Teacher } from "../types/domain";

type AuthState = {
  user: Teacher | null;
  setUser: (user: Teacher | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "teacher-1",
    fullName: "Adaeze Okafor",
    role: "teacher",
    schoolId: "school-demo"
  },
  setUser: (user) => set({ user })
}));
