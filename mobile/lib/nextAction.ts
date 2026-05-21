import type { Meal, Routine, TodaySnapshot } from "./api";

export type NavigateRoute =
  | { pathname: "/scan" }
  | { pathname: "/workouts" }
  | { pathname: "/session/[id]"; params: { id: string; routineId?: string } };

export type NextAction =
  | ({ kind: "navigate"; label: string } & NavigateRoute)
  | { kind: "start-session"; label: string; routineId: string };

const LOG_FOOD: NextAction = { kind: "navigate", label: "Log food", pathname: "/scan" };

function lastMealDate(meals: Meal[]): Date | null {
  if (!meals.length) return null;
  let latest: number | null = null;
  for (const m of meals) {
    const t = Date.parse(m.scanned_at);
    if (!isNaN(t) && (latest === null || t > latest)) latest = t;
  }
  return latest === null ? null : new Date(latest);
}

export function pickNextAction(today: TodaySnapshot | null, routines: Routine[] | null, now: Date): NextAction {
  if (!today) return LOG_FOOD;

  const hour = now.getHours();
  const meals = today.meals ?? [];
  const active = today.active_session ?? null;
  const completed = today.last_completed_session_today ?? null;
  const scheduled = today.scheduled_routine_today ?? null;

  if (active) {
    const name = active.routine_name ?? "workout";
    return {
      kind: "navigate",
      label: `Resume ${name}`,
      pathname: "/session/[id]",
      params: { id: active.id, routineId: active.routine_id ?? undefined },
    };
  }

  if (scheduled && !completed) {
    return { kind: "start-session", label: `Start ${scheduled.name}`, routineId: scheduled.id };
  }

  if (meals.length === 0) {
    if (hour < 11) return { kind: "navigate", label: "Log breakfast", pathname: "/scan" };
    if (hour < 16) return { kind: "navigate", label: "Log lunch", pathname: "/scan" };
    return { kind: "navigate", label: "Log dinner", pathname: "/scan" };
  }

  if (today.remaining_calories < 0) {
    return { kind: "navigate", label: "Plan a workout", pathname: "/workouts" };
  }

  const proteinTarget = today.targets?.daily_protein_target_g ?? 0;
  if (
    proteinTarget > 0 &&
    today.consumed_protein_g < proteinTarget * 0.6 &&
    hour >= 14
  ) {
    return { kind: "navigate", label: "Log a protein-heavy meal", pathname: "/scan" };
  }

  if (hour >= 19) {
    const last = lastMealDate(meals);
    if (last && last.getHours() >= 17) {
      return { kind: "navigate", label: "Log a snack", pathname: "/scan" };
    }
    return { kind: "navigate", label: "Log dinner", pathname: "/scan" };
  }

  return LOG_FOOD;
}
