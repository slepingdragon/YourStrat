import type { Meal, MealItem } from "@/lib/api";

export type MealTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
};

export function normalizeMealItem(raw: Partial<MealItem>): MealItem {
  return {
    name: raw.name?.trim() || "Food",
    portion: raw.portion ?? null,
    calories: Math.max(0, Math.round(Number(raw.calories) || 0)),
    protein_g: Math.max(0, Number(raw.protein_g) || 0),
    carbs_g: Math.max(0, Number(raw.carbs_g) || 0),
    fat_g: Math.max(0, Number(raw.fat_g) || 0),
    fiber_g: Math.max(0, Number(raw.fiber_g) || 0),
    sugar_g: Math.max(0, Number(raw.sugar_g) || 0),
    sodium_mg: Math.max(0, Math.round(Number(raw.sodium_mg) || 0)),
    confidence: raw.confidence ?? null,
    confidence_range: raw.confidence_range ?? null,
  };
}

export function sumMealItems(items: MealItem[]): MealTotals {
  return items.reduce(
    (acc, it) => ({
      calories: acc.calories + (it.calories || 0),
      protein_g: acc.protein_g + (it.protein_g || 0),
      carbs_g: acc.carbs_g + (it.carbs_g || 0),
      fat_g: acc.fat_g + (it.fat_g || 0),
      fiber_g: acc.fiber_g + (it.fiber_g || 0),
      sugar_g: acc.sugar_g + (it.sugar_g || 0),
      sodium_mg: acc.sodium_mg + (it.sodium_mg || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 }
  );
}

export function totalsFromMeal(meal: Meal): MealTotals {
  return {
    calories: meal.total_calories,
    protein_g: meal.total_protein_g,
    carbs_g: meal.total_carbs_g,
    fat_g: meal.total_fat_g,
    fiber_g: meal.total_fiber_g ?? 0,
    sugar_g: meal.total_sugar_g ?? 0,
    sodium_mg: meal.total_sodium_mg ?? 0,
  };
}

/** Show "—" when value is missing or zero and `hideZero` is set for display-only rows. */
export function formatGram(value: number | undefined | null, hideZero = false): string {
  const n = Number(value);
  if (!Number.isFinite(n) || (hideZero && n <= 0)) return "—";
  return `${Math.round(n)}g`;
}

export function formatSodium(value: number | undefined | null, hideZero = false): string {
  const n = Number(value);
  if (!Number.isFinite(n) || (hideZero && n <= 0)) return "—";
  return `${Math.round(n)} mg`;
}
