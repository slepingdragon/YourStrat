import { METRIC_LEARN_MORE, type NutritionSourceLink } from "@/lib/nutritionSources";
import type { TodayMetricId } from "@/lib/todayMetrics";

export type { NutritionSourceLink };

export type NutritionMetricInfo = {
  unit: "cal" | "g" | "mg";
  learnMore: NutritionSourceLink[];
};

/**
 * Structural (non-translatable) metric data: unit + source links. The
 * user-facing title/about/tip strings live in i18n under the
 * `nutritionMetric.<id>.{title,about,tip}` keys and are resolved at the call
 * site so they react to language changes.
 */
export const METRIC_INFO: Record<TodayMetricId, NutritionMetricInfo> = {
  calories: { unit: "cal", learnMore: METRIC_LEARN_MORE.calories },
  protein: { unit: "g", learnMore: METRIC_LEARN_MORE.protein },
  carbs: { unit: "g", learnMore: METRIC_LEARN_MORE.carbs },
  fat: { unit: "g", learnMore: METRIC_LEARN_MORE.fat },
  sugar: { unit: "g", learnMore: METRIC_LEARN_MORE.sugar },
  sodium: { unit: "mg", learnMore: METRIC_LEARN_MORE.sodium },
  fiber: { unit: "g", learnMore: METRIC_LEARN_MORE.fiber },
};

export function isNutritionMetricId(id: string): id is TodayMetricId {
  return id in METRIC_INFO;
}
