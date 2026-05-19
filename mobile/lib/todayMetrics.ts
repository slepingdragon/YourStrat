import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Meal, NutritionDayTotals, TodaySnapshot } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import { colors } from "@/theme/colors";

export const TODAY_METRICS_STORAGE_KEY = "yourstrat_today_metrics";

export type TodayMetricId =
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "sugar"
  | "sodium"
  | "fiber";

export const ALL_TODAY_METRICS: TodayMetricId[] = [
  "calories",
  "protein",
  "carbs",
  "fat",
  "sugar",
  "sodium",
  "fiber",
];

export const DEFAULT_TODAY_METRICS: TodayMetricId[] = [...ALL_TODAY_METRICS];

export const TODAY_GRID_METRICS: TodayMetricId[] = ALL_TODAY_METRICS.filter((id) => id !== "calories");

/** Default Right now grid — all six non-calorie metrics (calories stay in hero). */
export const DEFAULT_VISIBLE_METRICS: TodayMetricId[] = [...TODAY_GRID_METRICS];

export const MAX_TODAY_METRICS = 7;

export type TodayMetricSpec = {
  id: TodayMetricId;
  label: string;
  color: string;
  unit: "cal" | "g" | "mg";
};

export const TODAY_METRIC_SPECS: Record<TodayMetricId, TodayMetricSpec> = {
  calories: { id: "calories", label: "Calories", color: colors.star, unit: "cal" },
  protein: { id: "protein", label: "Protein", color: colors.protein, unit: "g" },
  carbs: { id: "carbs", label: "Carbs", color: colors.carbs, unit: "g" },
  fat: { id: "fat", label: "Fat", color: colors.fat, unit: "g" },
  sugar: { id: "sugar", label: "Sugar", color: colors.warning, unit: "g" },
  sodium: { id: "sodium", label: "Sodium", color: colors.spark, unit: "mg" },
  fiber: { id: "fiber", label: "Fiber", color: colors.success, unit: "g" },
};

function isMetricId(v: string): v is TodayMetricId {
  return (ALL_TODAY_METRICS as string[]).includes(v);
}

export function normalizeTodayMetrics(raw: unknown): TodayMetricId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_TODAY_METRICS];
  const picked: TodayMetricId[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !isMetricId(item)) continue;
    if (picked.includes(item)) continue;
    picked.push(item);
    if (picked.length >= MAX_TODAY_METRICS) break;
  }
  return picked.length > 0 ? picked : [...DEFAULT_TODAY_METRICS];
}

const LEGACY_DEFAULT_TODAY_METRICS: TodayMetricId[] = ["calories", "protein", "carbs", "fat"];

function isLegacyDefaultMetrics(metrics: TodayMetricId[]): boolean {
  if (metrics.length !== LEGACY_DEFAULT_TODAY_METRICS.length) return false;
  return LEGACY_DEFAULT_TODAY_METRICS.every((id) => metrics.includes(id));
}

function hasFullGridSelection(metrics: TodayMetricId[]): boolean {
  return TODAY_GRID_METRICS.every((id) => metrics.includes(id));
}

export async function loadTodayMetrics(): Promise<TodayMetricId[]> {
  try {
    const raw = await AsyncStorage.getItem(TODAY_METRICS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_TODAY_METRICS];
    const loaded = normalizeTodayMetrics(JSON.parse(raw));
    if (isLegacyDefaultMetrics(loaded)) return [...DEFAULT_TODAY_METRICS];
    if (!hasFullGridSelection(loaded)) return [...DEFAULT_TODAY_METRICS];
    return loaded;
  } catch {
    return [...DEFAULT_TODAY_METRICS];
  }
}

export async function saveTodayMetrics(metrics: TodayMetricId[]): Promise<void> {
  const normalized = normalizeTodayMetrics(metrics);
  await AsyncStorage.setItem(TODAY_METRICS_STORAGE_KEY, JSON.stringify(normalized));
}

export function getMetricValue(today: TodaySnapshot, id: TodayMetricId): number {
  switch (id) {
    case "calories":
      return today.consumed_calories;
    case "protein":
      return today.consumed_protein_g;
    case "carbs":
      return today.consumed_carbs_g;
    case "fat":
      return today.consumed_fat_g;
    case "sugar":
      return today.consumed_sugar_g ?? 0;
    case "sodium":
      return today.consumed_sodium_mg ?? 0;
    case "fiber":
      return today.consumed_fiber_g ?? 0;
    default:
      return 0;
  }
}

export function getMetricTarget(targets: NutritionTargets, id: TodayMetricId): number {
  switch (id) {
    case "calories":
      return targets.calories;
    case "protein":
      return targets.protein_g;
    case "carbs":
      return targets.carbs_g;
    case "fat":
      return targets.fat_g;
    case "sugar":
      return targets.sugar_g;
    case "sodium":
      return targets.sodium_mg;
    case "fiber":
      return targets.fiber_g;
    default:
      return 0;
  }
}

export function getMetricValueFromTotals(totals: NutritionDayTotals, id: TodayMetricId): number {
  switch (id) {
    case "calories":
      return totals.calories;
    case "protein":
      return totals.protein_g;
    case "carbs":
      return totals.carbs_g;
    case "fat":
      return totals.fat_g;
    case "sugar":
      return totals.sugar_g;
    case "sodium":
      return totals.sodium_mg;
    case "fiber":
      return totals.fiber_g;
    default:
      return 0;
  }
}

export function getMetricValueFromMeal(meal: Meal, id: TodayMetricId): number {
  switch (id) {
    case "calories":
      return meal.total_calories;
    case "protein":
      return meal.total_protein_g;
    case "carbs":
      return meal.total_carbs_g;
    case "fat":
      return meal.total_fat_g;
    case "sugar":
      return meal.total_sugar_g ?? 0;
    case "sodium":
      return meal.total_sodium_mg ?? 0;
    case "fiber":
      return meal.total_fiber_g ?? 0;
    default:
      return 0;
  }
}

export function formatMetricAmount(value: number, unit: "cal" | "g" | "mg"): string {
  const v = Math.round(value);
  if (unit === "cal") return `${v} cal`;
  if (unit === "mg") return `${v} mg`;
  return `${v}g`;
}

export function isLimitMetric(id: TodayMetricId): boolean {
  return id === "sugar" || id === "sodium";
}

/** Compact Today grid card: headline, subline, progress fill. */
export function metricGridCard(
  id: TodayMetricId,
  consumed: number,
  target: number
): { headline: string; subline: string; over: boolean; progress: number } {
  const spec = TODAY_METRIC_SPECS[id];
  const { unit } = spec;

  if (target <= 0) {
    return {
      headline: "No target",
      subline: "Set in Profile",
      over: false,
      progress: 0,
    };
  }

  const left = target - consumed;
  const amount = Math.abs(Math.round(left));
  const goalWord = isLimitMetric(id) ? "limit" : "target";
  const consumedLabel =
    unit === "cal"
      ? `${Math.round(consumed)}`
      : unit === "mg"
        ? `${Math.round(consumed)}mg`
        : `${Math.round(consumed)}g`;
  const targetLabel =
    unit === "cal"
      ? `${Math.round(target)}`
      : unit === "mg"
        ? `${Math.round(target)}mg`
        : `${Math.round(target)}g`;
  const subline = `${consumedLabel} of ${targetLabel} ${goalWord}`;

  if (left > 0.5) {
    const headline =
      unit === "mg" ? `${amount}mg to go` : unit === "cal" ? `${amount} left` : `${amount}g to go`;
    return {
      headline,
      subline,
      over: false,
      progress: Math.min(1, Math.max(0, consumed / target)),
    };
  }

  if (left < -0.5) {
    const headline =
      unit === "mg" ? `${amount}mg over` : unit === "cal" ? `${amount} over` : `${amount}g over`;
    return {
      headline,
      subline,
      over: true,
      progress: 1,
    };
  }

  return {
    headline: "On target",
    subline,
    over: false,
    progress: 1,
  };
}

export function metricBalance(
  consumed: number,
  target: number,
  unit: "cal" | "g" | "mg"
): { text: string; color: string; over: boolean } {
  if (target <= 0) {
    return { text: "Set a target in Profile", color: colors.textMuted, over: false };
  }
  const diff = target - consumed;
  const amount = Math.abs(Math.round(diff));
  const formatted = formatMetricAmount(amount, unit);
  if (diff > 0) return { text: `${formatted} left`, color: colors.success, over: false };
  if (diff < 0) return { text: `${formatted} over`, color: colors.error, over: true };
  return { text: "On target", color: colors.success, over: false };
}

export function toggleTodayMetric(
  current: TodayMetricId[],
  id: TodayMetricId
): TodayMetricId[] | null {
  if (current.includes(id)) {
    if (current.length <= 1) return null;
    return current.filter((m) => m !== id);
  }
  if (current.length >= MAX_TODAY_METRICS) return null;
  return [...current, id];
}
