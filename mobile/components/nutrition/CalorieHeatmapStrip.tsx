import { memo } from "react";
import { Text, View } from "react-native";
import type { NutritionDay } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import { getMetricTarget, getMetricValueFromTotals } from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

const DOW = ["S", "M", "T", "W", "T", "F", "S"] as const;
const BAR_MAX_H = 64;
const CAP = 1.15; // bar height caps a little above target

type Props = {
  /** 7 days oldest→newest. */
  days: NutritionDay[];
  targets: NutritionTargets;
  todayKey: string;
};

/** Mean proximity of P/C/F to their targets (0..1); 1 = on target. */
function macroAdherence(day: NutritionDay, targets: NutritionTargets): number {
  let sum = 0;
  let n = 0;
  for (const id of ["protein", "carbs", "fat"] as const) {
    const t = getMetricTarget(targets, id);
    if (t <= 0) continue;
    const v = getMetricValueFromTotals(day.totals, id);
    sum += 1 - Math.min(1, Math.abs(v - t) / t);
    n++;
  }
  return n ? sum / n : 0;
}

/** Calm adherence color — green (good) → neutral → dim. No red/amber alarm. */
function adherenceColor(adherence: number): string {
  if (adherence >= 0.8) return colors.success;
  if (adherence >= 0.55) return colors.starDim;
  return colors.textMuted;
}

/**
 * Weekly trends as one ~80pt strip (N-S1, Story 6.3): 7 vertical bars, height =
 * kcal vs target, color = macro adherence. Replaces the per-nutrient trend-row
 * list (per-nutrient detail lives in the metric drill-down).
 */
function CalorieHeatmapStripImpl({ days, targets, todayKey }: Props) {
  const calTarget = getMetricTarget(targets, "calories");
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: BAR_MAX_H + 20,
        paddingHorizontal: spacing.xs,
      }}
      accessibilityLabel="Last 7 days calories vs target, colored by macro adherence"
    >
      {days.map((d) => {
        const kcal = d.totals.calories;
        const frac = calTarget > 0 ? Math.min(CAP, kcal / calTarget) / CAP : 0;
        const h = Math.max(kcal > 0 ? 3 : 0, frac * BAR_MAX_H);
        const isToday = d.date === todayKey;
        const color = kcal > 0 ? adherenceColor(macroAdherence(d, targets)) : colors.surfaceElevated;
        const dow = DOW[new Date(`${d.date}T12:00:00`).getDay()];
        return (
          <View key={d.date} style={{ alignItems: "center", flex: 1 }}>
            <View style={{ height: BAR_MAX_H, justifyContent: "flex-end" }}>
              <View
                style={{
                  width: 18,
                  height: h,
                  borderRadius: radius.sm,
                  backgroundColor: color,
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: colors.star,
                }}
              />
            </View>
            <Text
              style={{
                color: isToday ? colors.textPrimary : colors.textMuted,
                fontSize: 11,
                fontWeight: isToday ? "700" : "500",
                marginTop: 6,
              }}
            >
              {dow}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export const CalorieHeatmapStrip = memo(CalorieHeatmapStripImpl);
