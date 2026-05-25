import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { TodaySnapshot } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import {
  TODAY_METRIC_SPECS,
  formatMetricAmount,
  getMetricTarget,
  getMetricValue,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

type Props = {
  today: TodaySnapshot;
  targets: NutritionTargets;
  metrics: TodayMetricId[];
  onCustomize: () => void;
};

function MetricCard({ id, today, targets }: { id: TodayMetricId; today: TodaySnapshot; targets: NutritionTargets }) {
  const router = useRouter();
  const spec = TODAY_METRIC_SPECS[id];
  const consumed = getMetricValue(today, id);
  const target = getMetricTarget(targets, id);
  const over = target > 0 && consumed > target;
  const progress = target > 0 ? Math.min(1, Math.max(0, consumed / target)) : 0;
  const barColor = over ? colors.error : spec.color;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id } })}
      accessibilityRole="button"
      accessibilityLabel={`${spec.label}, ${Math.round(consumed)} of ${formatMetricAmount(target, spec.unit)}`}
      style={({ pressed }) => ({
        flexBasis: "48%",
        flexGrow: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: spacing.xs }}>{spec.label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={{ color: over ? colors.error : colors.textPrimary, fontSize: 22, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
          {Math.round(consumed)}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: spacing.xs, fontVariant: ["tabular-nums"] }}>
          / {formatMetricAmount(target, spec.unit)}
        </Text>
      </View>
      <View style={{ height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: spacing.sm, overflow: "hidden" }}>
        <View style={{ height: 3, width: `${progress * 100}%`, backgroundColor: barColor, borderRadius: 2 }} />
      </View>
    </Pressable>
  );
}

/** The personalizable "Right now" nutrient grid (calories live in the hero). */
function NutrientGridImpl({ today, targets, metrics, onCustomize }: Props) {
  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Right now</Text>
        <Pressable onPress={onCustomize} hitSlop={8} accessibilityRole="button" accessibilityLabel="Customize Today">
          <Text style={{ color: colors.spark, fontSize: 13, fontWeight: "600" }}>Customize</Text>
        </Pressable>
      </View>
      {metrics.length === 0 ? (
        <Pressable
          onPress={onCustomize}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>No nutrients shown. Tap to add some.</Text>
        </Pressable>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {metrics.map((id) => (
            <MetricCard key={id} id={id} today={today} targets={targets} />
          ))}
        </View>
      )}
    </View>
  );
}

export const NutrientGrid = memo(NutrientGridImpl);
