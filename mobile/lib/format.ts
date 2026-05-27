// Single-source numeric formatters (Story 1.1). Every calorie / weight / macro
// number rendered in the UI goes through one of these so display rounding and
// thousands separators can never drift between surfaces (AP-11). Rounding
// mirrors the existing roundCal/roundG conventions; the conversion helpers come
// from lib/targets so there is one source for both math and display.
import { kgToLbs, roundCal, roundG } from "@/lib/targets";

/** Calories, for display: rounded to the nearest 5 with a locale-aware
 *  thousands separator. e.g. 1422 → "1,420", 0 → "0". */
export function formatKcal(n: number): string {
  return roundCal(n).toLocaleString();
}

/** Body / lift weight, for display: metric rounds to the nearest 0.5 kg,
 *  imperial to the whole pound, each with its unit suffix.
 *  `kg` is always the stored (metric) value; `units` is the user's preference. */
export function formatWeight(kg: number, units: "metric" | "imperial"): string {
  if (units === "imperial") {
    return `${Math.round(kgToLbs(kg)).toLocaleString()} lb`;
  }
  const halfKg = Math.round(kg * 2) / 2;
  return `${halfKg.toLocaleString()} kg`;
}

/** Macro grams, for display: rounded to the nearest gram with a locale-aware
 *  thousands separator (no unit suffix — callers append g / mg). */
export function formatMacroGrams(n: number): string {
  return roundG(n).toLocaleString();
}
