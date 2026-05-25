import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { normalizeProfile, type NutritionDay, type Profile, type Routine, type TodaySnapshot } from "./api";

export type ToastAction = { label: string; onPress: () => void };
export type Toast = { message: string; action?: ToastAction };

/** App-wide pointer to the in-flight workout (W-C2). Detailed set/exercise
 * progress stays local to ActiveSessionRunner; only this pointer + the rest
 * deadline are global, so the Workouts-tab takeover and the cross-tab badge
 * read one source of truth. */
export type ActiveSession = { id: string; routineId: string | null } | null;

type State = {
  session: Session | null;
  profile: Profile | null;
  today: TodaySnapshot | null;
  routines: Routine[] | null;
  sparkline: NutritionDay[] | null;
  toast: Toast | null;
  activeSession: ActiveSession;
  restEndsAt: number | null; // epoch ms; null when not resting (drives the 1Hz tab badge)
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  setToday: (t: TodaySnapshot | null) => void;
  setRoutines: (r: Routine[] | null) => void;
  setSparkline: (d: NutritionDay[] | null) => void;
  showToast: (toast: Toast) => void;
  clearToast: () => void;
  setActiveSession: (s: ActiveSession) => void;
  clearActiveSession: () => void;
  setRestEndsAt: (t: number | null) => void;
};

export const useStore = create<State>((set) => ({
  session: null,
  profile: null,
  today: null,
  routines: null,
  sparkline: null,
  toast: null,
  activeSession: null,
  restEndsAt: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile: profile ? normalizeProfile(profile) : null }),
  setToday: (today) => set({ today }),
  setRoutines: (routines) => set({ routines }),
  setSparkline: (sparkline) => set({ sparkline }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  setActiveSession: (activeSession) => set({ activeSession }),
  clearActiveSession: () => set({ activeSession: null, restEndsAt: null }),
  setRestEndsAt: (restEndsAt) => set({ restEndsAt }),
}));
