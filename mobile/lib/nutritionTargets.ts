import type { Profile } from "@/lib/api";

/** Daily limits used for heart-health callouts (matches backend today.py). */
export const HEART_LIMITS = {
  sugar_g: 50,
  sodium_mg: 2300,
} as const;

/** Common athlete fiber goal when not personalized. */
export const ATHLETE_FIBER_TARGET_G = 30;

export type NutritionTargets = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
  sodium_mg: number;
  fiber_g: number;
};

export function targetsFromProfile(profile: Profile | null): NutritionTargets | null {
  if (!profile) return null;
  return {
    calories: profile.daily_calorie_target,
    protein_g: profile.daily_protein_target_g,
    carbs_g: profile.daily_carbs_target_g,
    fat_g: profile.daily_fat_target_g,
    sugar_g: HEART_LIMITS.sugar_g,
    sodium_mg: HEART_LIMITS.sodium_mg,
    fiber_g: ATHLETE_FIBER_TARGET_G,
  };
}
