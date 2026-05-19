import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { normalizeProfile, type Profile, type TodaySnapshot } from "./api";

type State = {
  session: Session | null;
  profile: Profile | null;
  today: TodaySnapshot | null;
  toast: string | null;
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  setToday: (t: TodaySnapshot | null) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
};

export const useStore = create<State>((set) => ({
  session: null,
  profile: null,
  today: null,
  toast: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile: profile ? normalizeProfile(profile) : null }),
  setToday: (today) => set({ today }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
