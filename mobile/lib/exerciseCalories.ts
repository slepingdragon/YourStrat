import type { CatalogExercise } from "@/lib/exerciseCatalog";

export const DEFAULT_MET = {
  strength: 5.0,
  cardio: 8.0,
  mobility: 2.5,
} as const;

export function metForExercise(exercise: CatalogExercise): number {
  if (exercise.met_value != null) return exercise.met_value;
  return DEFAULT_MET[exercise.type] ?? 5.0;
}

/** Matches backend session burn: sets×reps×3 sec for strength, else catalog defaults. */
export function estimateExerciseDurationSec(
  exercise: CatalogExercise,
  sets?: number,
  reps?: number,
  durationSec?: number
): number {
  if (durationSec != null) return durationSec;
  if (exercise.type === "cardio" || exercise.type === "mobility") {
    return exercise.default_duration_sec ?? (exercise.type === "cardio" ? 600 : 60);
  }
  const s = sets ?? exercise.default_sets ?? 3;
  const r = reps ?? exercise.default_reps ?? 10;
  return s * r * 3;
}

/** calories = MET × weight_kg × hours (same as backend `calories_burned`). */
export function estimateExerciseCalories(
  exercise: CatalogExercise,
  weightKg: number,
  sets?: number,
  reps?: number,
  durationSec?: number
): number {
  const met = metForExercise(exercise);
  const dur = estimateExerciseDurationSec(exercise, sets, reps, durationSec);
  const durationMin = dur / 60.0;
  return Math.round(met * weightKg * (durationMin / 60.0));
}

export function formatDefaultVolume(exercise: CatalogExercise): string {
  if (exercise.type === "cardio" || exercise.type === "mobility") {
    const min = Math.round((exercise.default_duration_sec ?? 60) / 60);
    return `${min} min`;
  }
  return `${exercise.default_sets ?? 3} × ${exercise.default_reps ?? 10}`;
}
