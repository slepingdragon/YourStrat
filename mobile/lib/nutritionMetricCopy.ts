import { METRIC_LEARN_MORE, type NutritionSourceLink } from "@/lib/nutritionSources";
import type { TodayMetricId } from "@/lib/todayMetrics";

export type { NutritionSourceLink };

export type NutritionMetricInfo = {
  title: string;
  about: string;
  unit: "cal" | "g" | "mg";
  tip: string;
  learnMore: NutritionSourceLink[];
};

export const METRIC_INFO: Record<TodayMetricId, NutritionMetricInfo> = {
  calories: {
    title: "Calories",
    about:
      "Calories measure the energy your food provides. Your body uses that energy for movement, recovery, and basic functions like breathing and digestion.",
    unit: "cal",
    tip: "Spread intake across meals so you are not starving at night or overeating in one sitting.",
    learnMore: METRIC_LEARN_MORE.calories,
  },
  protein: {
    title: "Protein",
    about:
      "Protein supplies amino acids your body uses to repair muscle, make enzymes, and support immune function. Active people often aim higher to recover from training.",
    unit: "g",
    tip: "Include protein at each meal — eggs, yogurt, chicken, tofu, or beans all count.",
    learnMore: METRIC_LEARN_MORE.protein,
  },
  carbs: {
    title: "Carbohydrates",
    about:
      "Carbs are your body's preferred fuel for hard efforts and daily activity. They break down into glucose, which muscles and your brain use for energy.",
    unit: "g",
    tip: "Whole grains, fruit, and starchy vegetables give carbs plus fiber and micronutrients.",
    learnMore: METRIC_LEARN_MORE.carbs,
  },
  fat: {
    title: "Fat",
    about:
      "Dietary fat helps you absorb vitamins A, D, E, and K, supports hormones, and adds satiety. Unsaturated fats from nuts, olive oil, and fish are especially helpful.",
    unit: "g",
    tip: "You do not need to avoid fat — balance it with protein and carbs for your goal.",
    learnMore: METRIC_LEARN_MORE.fat,
  },
  sugar: {
    title: "Sugar",
    about:
      "Added and natural sugars contribute quick energy but little nutrition when they crowd out other foods. High added sugar intake is linked to weight gain and metabolic strain over time.",
    unit: "g",
    tip: "Watch sugary drinks and desserts; whole fruit includes fiber that slows absorption.",
    learnMore: METRIC_LEARN_MORE.sugar,
  },
  sodium: {
    title: "Sodium",
    about:
      "Sodium helps fluid balance and nerve signals, but most people eat more than they need from packaged and restaurant food. Too much sodium over time can raise blood pressure for many people.",
    unit: "mg",
    tip: "Cooking at home and rinsing canned beans lowers sodium without bland food.",
    learnMore: METRIC_LEARN_MORE.sodium,
  },
  fiber: {
    title: "Fiber",
    about:
      "Fiber feeds healthy gut bacteria, slows digestion, and helps you feel full. Soluble fiber (oats, beans) may support cholesterol; insoluble fiber (vegetables, whole grains) keeps digestion regular.",
    unit: "g",
    tip: "Build up fiber gradually and drink water to avoid discomfort.",
    learnMore: METRIC_LEARN_MORE.fiber,
  },
};

export function isNutritionMetricId(id: string): id is TodayMetricId {
  return id in METRIC_INFO;
}
