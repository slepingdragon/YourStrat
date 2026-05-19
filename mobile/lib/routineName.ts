import type { CatalogExercise } from "@/lib/exerciseCatalog";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function nameFromExercises(exercises: CatalogExercise[]): string | null {
  if (exercises.length === 0) return null;
  const names = exercises.slice(0, 3).map((e) => e.name);
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}

/** Picks a routine display name: custom → template → exercises → weekday fallback. */
export function suggestRoutineName(opts: {
  custom?: string;
  templateName?: string;
  exercises: CatalogExercise[];
}): string {
  const custom = opts.custom?.trim();
  if (custom) return custom;

  const template = opts.templateName?.trim();
  if (template) return template;

  const fromExercises = nameFromExercises(opts.exercises);
  if (fromExercises) return fromExercises;

  const day = WEEKDAY_SHORT[new Date().getDay()];
  return `Workout · ${day}`;
}

/** Consistent title-style label for lists and headers (does not change stored name). */
export function displayRoutineName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Routine";
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.length > 1 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function routineExerciseCount(routine: {
  exercise_count?: number;
  exercises?: unknown[] | null;
}): number {
  if (typeof routine.exercise_count === "number") return routine.exercise_count;
  return routine.exercises?.length ?? 0;
}
