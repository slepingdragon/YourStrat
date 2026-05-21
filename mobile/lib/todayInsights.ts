import type { Profile, TodaySnapshot } from "@/lib/api";
import {
  ATHLETE_FIBER_TARGET_G,
  HEART_LIMITS,
  targetsFromProfile,
} from "@/lib/nutritionTargets";
import { roundCal, roundG } from "@/lib/targets";
import type { TodayMetricId } from "@/lib/todayMetrics";

/** Real, number-derived bullets for Today — no generic wellness copy. */
export function buildTodayInsights(today: TodaySnapshot, profile: Profile | null): string[] {
  const insights: string[] = [];
  const t = today.targets ?? profile;
  if (!t) return insights;

  const targets = targetsFromProfile(t);
  if (!targets) return insights;

  const consumed = {
    calories: today.consumed_calories,
    protein_g: today.consumed_protein_g,
    carbs_g: today.consumed_carbs_g,
    fat_g: today.consumed_fat_g,
    fiber_g: today.consumed_fiber_g ?? 0,
    sugar_g: today.consumed_sugar_g ?? 0,
    sodium_mg: today.consumed_sodium_mg ?? 0,
  };

  if (today.remaining_calories > 0) {
    insights.push(`About ${roundCal(today.remaining_calories)} calories left for today.`);
  } else if (today.remaining_calories < 0) {
    insights.push(`You're ${roundCal(Math.abs(today.remaining_calories))} calories over your target.`);
  }

  const proteinShort = t.daily_protein_target_g - consumed.protein_g;
  if (proteinShort >= 1) {
    const pct =
      t.daily_protein_target_g > 0
        ? Math.round((consumed.protein_g / t.daily_protein_target_g) * 100)
        : 0;
    if (pct >= 40 && pct < 100) {
      insights.push(
        `${roundG(proteinShort)}g protein to go — about ${pct}% of your ${roundG(t.daily_protein_target_g)}g target so far.`
      );
    } else {
      insights.push(
        `${roundG(proteinShort)}g protein to go — ${roundG(consumed.protein_g)} of ${roundG(t.daily_protein_target_g)}g so far.`
      );
    }
  }

  const carbsOver = consumed.carbs_g - t.daily_carbs_target_g;
  if (carbsOver >= 1) {
    insights.push(`You're ${roundG(carbsOver)}g over on carbs.`);
  }

  const fatOver = consumed.fat_g - t.daily_fat_target_g;
  if (fatOver >= 1) {
    insights.push(`You're ${roundG(fatOver)}g over on fat.`);
  }

  const sugarOver = consumed.sugar_g - HEART_LIMITS.sugar_g;
  if (sugarOver >= 1) {
    insights.push(`You're ${roundG(sugarOver)}g over the ${HEART_LIMITS.sugar_g}g sugar guide.`);
  } else if (consumed.sugar_g > 0) {
    const sugarLeft = HEART_LIMITS.sugar_g - consumed.sugar_g;
    if (sugarLeft <= 15) {
      insights.push(`${roundG(sugarLeft)}g sugar left before the ${HEART_LIMITS.sugar_g}g daily guide.`);
    }
  }

  const sodiumOver = consumed.sodium_mg - HEART_LIMITS.sodium_mg;
  if (sodiumOver >= 1) {
    insights.push(`You're ${roundG(sodiumOver)}mg over the ${HEART_LIMITS.sodium_mg}mg sodium guide.`);
  } else if (consumed.sodium_mg > 0) {
    const sodiumLeft = HEART_LIMITS.sodium_mg - consumed.sodium_mg;
    if (sodiumLeft <= 400) {
      insights.push(`${roundG(sodiumLeft)}mg sodium left before the ${HEART_LIMITS.sodium_mg}mg guide.`);
    }
  }

  const fiberShort = ATHLETE_FIBER_TARGET_G - consumed.fiber_g;
  if (fiberShort >= 1 && consumed.fiber_g > 0) {
    insights.push(`${roundG(fiberShort)}g fiber to reach ${ATHLETE_FIBER_TARGET_G}g.`);
  } else if (consumed.fiber_g >= ATHLETE_FIBER_TARGET_G) {
    insights.push(`Fiber at ${roundG(consumed.fiber_g)}g — at or above your ${ATHLETE_FIBER_TARGET_G}g goal.`);
  }

  if (today.burned_calories > 0 && insights.length < 4) {
    insights.push(`${today.burned_calories} calories burned today — counted in what's left.`);
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of insights) {
    if (seen.has(line)) continue;
    seen.add(line);
    unique.push(line);
    if (unique.length >= 4) break;
  }

  return unique;
}

/** At most one line when limits/macros need attention — not calories, protein, or fiber already in the grid. */
export function buildTodayHighlight(today: TodaySnapshot, profile: Profile | null): string | null {
  const lines = buildTodayInsights(today, profile).filter((line) => {
    if (line.includes("calories left for today")) return false;
    if (line.includes("calories over your target")) return false;
    if (line.includes("calories burned today")) return false;
    if (line.includes("protein to go")) return false;
    if (line.includes("fiber to reach") || line.startsWith("Fiber at")) return false;
    return true;
  });

  const overLimit = lines.find((l) => l.includes("over the") && (l.includes("sugar") || l.includes("sodium")));
  if (overLimit) return overLimit;

  const macroOver = lines.find((l) => l.includes("over on"));
  if (macroOver) return macroOver;

  const nearLimit = lines.find((l) => l.includes("left before"));
  if (nearLimit) return nearLimit;

  return null;
}

export type WatchlistMetric = {
  id: TodayMetricId;
  headline: string;
  sub: string;
  tone: "error" | "warning";
};

/** Pick at most one nutrient that needs attention right now. Structured for a card UI. */
export function pickWatchlistMetric(today: TodaySnapshot, profile: Profile | null): WatchlistMetric | null {
  const t = today.targets ?? profile;
  if (!t) return null;

  const consumed = {
    carbs_g: today.consumed_carbs_g,
    fat_g: today.consumed_fat_g,
    sugar_g: today.consumed_sugar_g ?? 0,
    sodium_mg: today.consumed_sodium_mg ?? 0,
  };

  const sodiumOver = consumed.sodium_mg - HEART_LIMITS.sodium_mg;
  if (sodiumOver >= 1) {
    return {
      id: "sodium",
      headline: "Sodium",
      sub: `${roundG(sodiumOver)}mg over the ${HEART_LIMITS.sodium_mg.toLocaleString()}mg guide`,
      tone: "error",
    };
  }

  const sugarOver = consumed.sugar_g - HEART_LIMITS.sugar_g;
  if (sugarOver >= 1) {
    return {
      id: "sugar",
      headline: "Sugar",
      sub: `${roundG(sugarOver)}g over the ${HEART_LIMITS.sugar_g}g guide`,
      tone: "error",
    };
  }

  const carbsOver = consumed.carbs_g - t.daily_carbs_target_g;
  if (carbsOver >= 1) {
    return {
      id: "carbs",
      headline: "Carbs",
      sub: `${roundG(carbsOver)}g over target`,
      tone: "warning",
    };
  }

  const fatOver = consumed.fat_g - t.daily_fat_target_g;
  if (fatOver >= 1) {
    return {
      id: "fat",
      headline: "Fat",
      sub: `${roundG(fatOver)}g over target`,
      tone: "warning",
    };
  }

  if (consumed.sugar_g > 0) {
    const sugarLeft = HEART_LIMITS.sugar_g - consumed.sugar_g;
    if (sugarLeft <= 15) {
      return {
        id: "sugar",
        headline: "Sugar",
        sub: `${roundG(sugarLeft)}g left before the ${HEART_LIMITS.sugar_g}g guide`,
        tone: "warning",
      };
    }
  }

  if (consumed.sodium_mg > 0) {
    const sodiumLeft = HEART_LIMITS.sodium_mg - consumed.sodium_mg;
    if (sodiumLeft <= 400) {
      return {
        id: "sodium",
        headline: "Sodium",
        sub: `${roundG(sodiumLeft)}mg left before the ${HEART_LIMITS.sodium_mg.toLocaleString()}mg guide`,
        tone: "warning",
      };
    }
  }

  return null;
}
