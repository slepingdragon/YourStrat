import { Pressable, Text, View } from "react-native";
import { IntakeRing } from "@/components/IntakeRing";
import type { NutritionDayTotals } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import {
  getMetricTarget,
  getMetricValueFromTotals,
  TODAY_METRIC_SPECS,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

type Props = {
  totals: NutritionDayTotals;
  targets: NutritionTargets;
  /** When true, show only calories + macros (4 rings). */
  primaryOnly?: boolean;
  onMetricPress?: (id: TodayMetricId) => void;
};

const RING_SIZE = 80;

const PRIMARY_IDS: TodayMetricId[] = ["calories", "protein", "carbs", "fat"];
const MORE_IDS: TodayMetricId[] = ["sugar", "sodium", "fiber"];

export function NutritionRingsPanel({ totals, targets, primaryOnly, onMetricPress }: Props) {
  const ids = primaryOnly ? PRIMARY_IDS : [...PRIMARY_IDS, ...MORE_IDS];

  const ring = (id: TodayMetricId) => {
    const spec = TODAY_METRIC_SPECS[id];
    const node = (
      <IntakeRing
        label={spec.label}
        value={getMetricValueFromTotals(totals, id)}
        target={getMetricTarget(targets, id)}
        color={spec.color}
        unit={spec.unit}
        size={RING_SIZE}
      />
    );
    if (!onMetricPress) return <View key={id}>{node}</View>;
    return (
      <Pressable
        key={id}
        onPress={() => onMetricPress(id)}
        accessibilityRole="button"
        accessibilityLabel={`${spec.label} details`}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {node}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {ids.map(ring)}
    </View>
  );
}

export function formatDayTotalsLine(totals: NutritionDayTotals) {
  return `${Math.round(totals.calories)} cal · P ${Math.round(totals.protein_g)}g · C ${Math.round(totals.carbs_g)}g · F ${Math.round(totals.fat_g)}g`;
}
