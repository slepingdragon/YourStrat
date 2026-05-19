import { Platform } from "react-native";
import { supabase } from "./supabase";

/** Native uses EXPO_PUBLIC_API_URL; web uses Metro /api proxy (same origin, no CORS). */
export function getApiBaseUrl(): string {
  if (Platform.OS === "web") {
    return "/api";
  }
  return (process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000").trim();
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Dev/preview: verify API is reachable (web → /api/health via Metro proxy). */
export async function pingApiHealth(): Promise<boolean> {
  try {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const res = await apiFetch(`${base}/health`);
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("json")) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body?.ok === true;
  } catch {
    return false;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${session.access_token}` };
}

async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    if (isNetworkError(e)) {
      throw new Error("Failed to fetch");
    }
    throw e;
  }
}

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first) {
      return String((first as { msg: string }).msg);
    }
  }
  return "Something went wrong. Try again.";
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.detail) detail = formatDetail(body.detail);
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function isUnauthorized(e: unknown): boolean {
  return isApiError(e) && e.status === 401;
}

export function isNetworkError(e: unknown): boolean {
  if (isApiError(e)) return false;
  const msg = e instanceof Error ? e.message : "";
  return /failed to fetch|network request failed|load failed/i.test(msg);
}

export type TrialStatus = {
  trial_active: boolean;
  days_remaining: number;
  scans_today: number;
  scans_limit: number;
};

export const DEFAULT_TRIAL_STATUS: TrialStatus = {
  trial_active: false,
  days_remaining: 0,
  scans_today: 0,
  scans_limit: 10,
};

export function normalizeTrial(raw?: Partial<TrialStatus> | null): TrialStatus {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_TRIAL_STATUS };
  }
  return {
    trial_active: raw.trial_active ?? false,
    days_remaining: raw.days_remaining ?? 0,
    scans_today: raw.scans_today ?? 0,
    scans_limit: raw.scans_limit ?? DEFAULT_TRIAL_STATUS.scans_limit,
  };
}

export function normalizeProfile(raw: Profile): Profile {
  return { ...raw, trial: normalizeTrial(raw.trial) };
}

export type Profile = {
  id: string;
  units: "metric" | "imperial";
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: "male" | "female";
  activity_level: string;
  goal: string;
  daily_calorie_target: number;
  daily_protein_target_g: number;
  daily_carbs_target_g: number;
  daily_fat_target_g: number;
  trial: TrialStatus;
};

export type MealItem = {
  id?: string;
  name: string;
  portion?: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  confidence?: number | null;
};

export type Meal = {
  id: string;
  photo_url?: string | null;
  scanned_at: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g?: number;
  total_sugar_g?: number;
  total_sodium_mg?: number;
  items?: MealItem[];
};

export type TodaySnapshot = {
  targets: Profile;
  consumed_calories: number;
  consumed_protein_g: number;
  consumed_carbs_g: number;
  consumed_fat_g: number;
  consumed_fiber_g?: number;
  consumed_sugar_g?: number;
  consumed_sodium_mg?: number;
  burned_calories: number;
  remaining_calories: number;
  net_calories: number;
  callouts: string[];
  meals: Meal[];
};

export type Exercise = {
  id: string;
  name: string;
  type: "strength" | "cardio" | "mobility";
  met_value: number;
  default_sets?: number | null;
  default_reps?: number | null;
  default_duration_sec?: number | null;
};

export type RoutineExercise = {
  exercise_id: string;
  position: number;
  sets?: number | null;
  reps?: number | null;
  duration_sec?: number | null;
  rest_sec?: number | null;
  exercise?: Exercise | null;
};

export type Routine = {
  id: string;
  name: string;
  created_at?: string | null;
  exercises?: RoutineExercise[];
  scheduled_days?: number[];
  exercise_count?: number;
};

export type Session = {
  id: string;
  routine_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_sec?: number | null;
  calories_burned: number;
};

export type OnboardingInput = {
  units: "metric" | "imperial";
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: "male" | "female";
  activity_level: string;
  goal: string;
};

export async function onboard(body: OnboardingInput) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/profile/onboard"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return normalizeProfile(await handle<Profile>(res));
}

export async function getProfile() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/profile/"), { headers });
  return normalizeProfile(await handle<Profile>(res));
}

export async function getTrialStatus() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/profile/trial"), { headers });
  return normalizeTrial(await handle<TrialStatus>(res));
}

export async function updateProfile(body: Partial<OnboardingInput>) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/profile/"), {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return normalizeProfile(await handle<Profile>(res));
}

export type AiStats = {
  total_scans: number;
  scans_this_week: number;
  avg_confidence: number | null;
  low_confidence_count: number;
  accuracy_note: string;
};

export async function getAiStats() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/profile/ai-stats"), { headers });
  return handle<AiStats>(res);
}

export type NutritionDayTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
};

export type NutritionDay = {
  date: string;
  meals: Meal[];
  totals: NutritionDayTotals;
};

export type NutritionJournal = {
  days: NutritionDay[];
};

export async function getNutritionJournal(days = 14) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/meals/journal?days=${days}`), { headers });
  return handle<NutritionJournal>(res);
}

export async function getToday() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/today/"), { headers });
  const data = await handle<TodaySnapshot>(res);
  return { ...data, targets: normalizeProfile(data.targets) };
}

export async function scanMeal(uri: string, mime = "image/jpeg") {
  const headers = await authHeader();
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await fetch(uri).then((r) => r.blob());
    form.append("file", blob, "meal.jpg");
  } else {
    form.append("file", {
      uri,
      name: "meal.jpg",
      type: mime,
    } as unknown as Blob);
  }
  const res = await apiFetch(apiUrl("/meals/scan"), {
    method: "POST",
    headers: { ...headers },
    body: form,
  });
  return handle<{ items: MealItem[] }>(res);
}

export async function saveMeal(photoUrl: string | null, items: MealItem[]) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/meals/"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ photo_url: photoUrl, items }),
  });
  return handle<Meal>(res);
}

export async function getMeal(id: string) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/meals/${id}`), { headers });
  return handle<Meal>(res);
}

export async function deleteMeal(id: string) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/meals/${id}`), { method: "DELETE", headers });
  return handle<{ ok: boolean }>(res);
}

export async function listExercises() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/exercises/"), { headers });
  return handle<Exercise[]>(res);
}

export async function createExercise(body: Omit<Exercise, "id" | "met_value"> & { met_value?: number }) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/exercises/"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<Exercise>(res);
}

export async function listRoutines() {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/routines/"), { headers });
  return handle<Routine[]>(res);
}

export async function getRoutine(id: string) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/routines/${id}`), { headers });
  return handle<Routine>(res);
}

export async function createRoutine(name: string, exercises: RoutineExercise[], scheduledDays: number[] = []) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/routines/"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name, exercises, scheduled_days: scheduledDays }),
  });
  return handle<Routine>(res);
}

export async function startSession(routineId: string | null) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl("/sessions/start"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ routine_id: routineId }),
  });
  return handle<Session>(res);
}

export async function appendSet(sessionId: string, body: { exercise_id: string; position: number; reps?: number; weight_kg?: number; duration_sec?: number }) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/sessions/${sessionId}/sets`), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<{ ok: boolean }>(res);
}

export async function finishSession(sessionId: string) {
  const headers = await authHeader();
  const res = await apiFetch(apiUrl(`/sessions/${sessionId}/finish`), { method: "POST", headers });
  return handle<Session>(res);
}
