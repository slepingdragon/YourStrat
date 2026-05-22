import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Sparkline } from "@/components/nutrition/Sparkline";
import {
  formatMetricAmount,
  metricBalance,
  TODAY_METRIC_SPECS,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

type Props = {
  metricId: TodayMetricId;
  values7d: number[];
  today: number;
  target: number;
  onPress: () => void;
};

function NutrientTrendRowImpl({ metricId, values7d, today, target, onPress }: Props) {
  const spec = TODAY_METRIC_SPECS[metricId];
  const balance = metricBalance(today, target, spec.unit);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${spec.label} trend. ${formatMetricAmount(today, spec.unit)} today, target ${formatMetricAmount(target, spec.unit)}. Tap for detail.`}
      style={({ pressed }) => ({
        width: "100%",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
          {spec.label}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 8, flexWrap: "wrap" }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatMetricAmount(today, spec.unit)} / {formatMetricAmount(target, spec.unit)}
          </Text>
          <Text
            style={{
              color: balance.color,
              fontSize: 12,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
            }}
          >
            {balance.text}
          </Text>
        </View>
      </View>
      <Sparkline values={values7d} target={target} color={spec.color} width={88} height={28} />
    </Pressable>
  );
}

export const NutrientTrendRow = memo(NutrientTrendRowImpl);
