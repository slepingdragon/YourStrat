import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { TrendChart, type TrendPoint } from "@/components/nutrition/TrendChart";
import {
  formatMetricAmount,
  metricBalance,
  TODAY_METRIC_SPECS,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  metricId: TodayMetricId;
  points: TrendPoint[];
  today: number;
  target: number;
  avg: number;
  periodLabel?: string;
  onPress: () => void;
};

function NutrientTrendRowImpl({
  metricId,
  points,
  today,
  target,
  avg,
  periodLabel = "7d",
  onPress,
}: Props) {
  const spec = TODAY_METRIC_SPECS[metricId];
  const balance = metricBalance(today, target, spec.unit);
  const avgDiff = Math.round(today - avg);
  const avgPrefix = avgDiff > 0 ? "+" : "";
  const avgColor = avgDiff > 0 ? colors.warning : avgDiff < 0 ? colors.success : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${spec.label} trend. ${formatMetricAmount(today, spec.unit)} today, target ${formatMetricAmount(target, spec.unit)}. Tap for detail graph.`}
      style={({ pressed }) => ({
        width: "100%",
        paddingHorizontal: spacing.xs,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>
          {spec.label} trend
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600", textTransform: "uppercase" }}>
          {periodLabel}
        </Text>
      </View>

      <View style={{ marginTop: spacing.md + 2 }}>
        <TrendChart
          data={points}
          target={target}
          avg={avg}
          compact
          height={110}
          lineColor={balance.color}
          unitSuffix={spec.unit === "cal" ? "" : spec.unit}
        />
      </View>

      <View style={{ marginTop: spacing.md, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {formatMetricAmount(today, spec.unit)}
          </Text>
          <Text style={{ color: balance.color, fontSize: 13, fontWeight: "600", marginTop: spacing.xs / 2 }}>
            {balance.text}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
            Target {formatMetricAmount(target, spec.unit)}
          </Text>
          <Text style={{ color: avgColor, fontSize: 12, fontWeight: "600", marginTop: spacing.xs, fontVariant: ["tabular-nums"] }}>
            vs avg {avgPrefix}
            {formatMetricAmount(Math.abs(avgDiff), spec.unit)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const NutrientTrendRow = memo(NutrientTrendRowImpl);
