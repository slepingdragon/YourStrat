import type { Meal, NutritionDay, NutritionDayTotals } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export type SummaryStats = {
  streakDays: number;
  proteinHitRate: { hit: number; total: number };
  onTargetDays: { hit: number; total: number };
  avgCalories7d: number | null;
  bestStreakDays: number;
};

const ON_TARGET_CAL_TOLERANCE = 0.1;
const PROTEIN_HIT_RATIO = 0.9;

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function prevDateKey(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function hasAnyIntake(totals: NutritionDayTotals): boolean {
  return totals.calories > 0 || totals.protein_g > 0 || totals.carbs_g > 0 || totals.fat_g > 0;
}

function isOnTarget(totals: NutritionDayTotals, targets: NutritionTargets): boolean {
  if (targets.calories <= 0) return false;
  const calDiff = Math.abs(totals.calories - targets.calories) / targets.calories;
  if (calDiff > ON_TARGET_CAL_TOLERANCE) return false;
  if (targets.protein_g > 0 && totals.protein_g < targets.protein_g * PROTEIN_HIT_RATIO) return false;
  return true;
}

/** Pick the slot for a meal based on local hour of scanned_at. */
export function classifyMealSlot(scannedAt: string): MealSlot {
  const d = new Date(scannedAt);
  const h = d.getHours();
  if (h >= 5 && h < 10) return "breakfast";
  if (h >= 10 && h < 15) return "lunch";
  if (h >= 17 && h < 22) return "dinner";
  return "snack";
}

export function groupMealsBySlot(meals: Meal[]): Record<MealSlot, Meal[]> {
  const groups: Record<MealSlot, Meal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const m of meals) {
    groups[classifyMealSlot(m.scanned_at)].push(m);
  }
  for (const slot of MEAL_SLOT_ORDER) {
    groups[slot].sort((a, b) => a.scanned_at.localeCompare(b.scanned_at));
  }
  return groups;
}

/**
 * Compute summary stats across the journal.
 * - streakDays: consecutive recent days (ending yesterday, or today if today has intake) with intake
 * - proteinHitRate: out of last 7 logged days, how many met protein target
 * - onTargetDays: out of last 7 logged days, how many were within 10% of calorie target + 90% protein
 * - avgCalories7d: mean calories across last 7 days that have any intake
 */
export function computeSummaryStats(
  days: NutritionDay[],
  targets: NutritionTargets | null
): SummaryStats {
  const byDate = new Map(days.map((d) => [d.date, d]));

  const todayKey = isoToday();
  const todayHasIntake = (() => {
    const t = byDate.get(todayKey);
    return t ? hasAnyIntake(t.totals) : false;
  })();

  let streakDays = 0;
  let cursor = todayHasIntake ? todayKey : prevDateKey(todayKey);
  while (true) {
    const day = byDate.get(cursor);
    if (!day || !hasAnyIntake(day.totals)) break;
    streakDays += 1;
    cursor = prevDateKey(cursor);
    if (streakDays > days.length + 1) break;
  }

  let bestStreakDays = 0;
  let running = 0;
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let prev: string | null = null;
  for (const d of sorted) {
    if (!hasAnyIntake(d.totals)) {
      running = 0;
      prev = d.date;
      continue;
    }
    if (prev !== null && prevDateKey(d.date) !== prev) {
      running = 1;
    } else {
      running += 1;
    }
    if (running > bestStreakDays) bestStreakDays = running;
    prev = d.date;
  }

  const recentLogged = sorted
    .filter((d) => hasAnyIntake(d.totals))
    .slice(-7);

  let proteinHits = 0;
  let onTargetHits = 0;
  let calSum = 0;
  for (const d of recentLogged) {
    if (targets && targets.protein_g > 0 && d.totals.protein_g >= targets.protein_g * PROTEIN_HIT_RATIO) {
      proteinHits += 1;
    }
    if (targets && isOnTarget(d.totals, targets)) onTargetHits += 1;
    calSum += d.totals.calories;
  }

  return {
    streakDays,
    proteinHitRate: { hit: proteinHits, total: recentLogged.length },
    onTargetDays: { hit: onTargetHits, total: recentLogged.length },
    avgCalories7d: recentLogged.length ? Math.round(calSum / recentLogged.length) : null,
    bestStreakDays,
  };
}
