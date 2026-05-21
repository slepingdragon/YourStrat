import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { normalizeProfile, type NutritionDay, type Profile, type Routine, type TodaySnapshot } from "./api";

export type ToastAction = { label: string; onPress: () => void };
export type Toast = { message: string; action?: ToastAction };

type State = {
  session: Session | null;
  profile: Profile | null;
  today: TodaySnapshot | null;
  routines: Routine[] | null;
  sparkline: NutritionDay[] | null;
  toast: Toast | null;
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  setToday: (t: TodaySnapshot | null) => void;
  setRoutines: (r: Routine[] | null) => void;
  setSparkline: (d: NutritionDay[] | null) => void;
  showToast: (toast: Toast) => void;
  clearToast: () => void;
};

export const useStore = create<State>((set) => ({
  session: null,
  profile: null,
  today: null,
  routines: null,
  sparkline: null,
  toast: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile: profile ? normalizeProfile(profile) : null }),
  setToday: (today) => set({ today }),
  setRoutines: (routines) => set({ routines }),
  setSparkline: (sparkline) => set({ sparkline }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
