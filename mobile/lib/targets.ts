const ACTIVITY: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};
const GOAL_DELTA: Record<string, number> = { lose: -500, maintain: 0, gain: 300 };

export function bmr(sex: "male" | "female", weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (sex === "male" ? 5 : -161);
}

export function computeTargets(
  sex: "male" | "female",
  weightKg: number,
  heightCm: number,
  age: number,
  activity: string,
  goal: string
) {
  const cal = Math.round(bmr(sex, weightKg, heightCm, age) * ACTIVITY[activity] + GOAL_DELTA[goal]);
  return {
    daily_calorie_target: cal,
    daily_protein_target_g: Math.round((cal * 0.3) / 4),
    daily_carbs_target_g: Math.round((cal * 0.4) / 4),
    daily_fat_target_g: Math.round((cal * 0.3) / 9),
  };
}

export function lbsToKg(lbs: number) {
  return lbs / 2.205;
}
export function kgToLbs(kg: number) {
  return kg * 2.205;
}
export function inToCm(inches: number) {
  return inches * 2.54;
}
export function cmToIn(cm: number) {
  return cm / 2.54;
}

export function roundCal(n: number) {
  return Math.round(n / 5) * 5;
}
export function roundG(n: number) {
  return Math.round(n);
}
