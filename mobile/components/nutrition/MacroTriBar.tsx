import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { NutritionDayTotals } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import type { TodayMetricId } from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

type RowKey = "protein" | "carbs" | "fat" | "sugar";

const ROW_DEFS: { key: RowKey; metricId: TodayMetricId; label: string; color: string }[] = [
  { key: "protein", metricId: "protein", label: "Protein", color: colors.protein },
  { key: "carbs", metricId: "carbs", label: "Carbs", color: colors.carbs },
  { key: "fat", metricId: "fat", label: "Fat", color: colors.fat },
  { key: "sugar", metricId: "sugar", label: "Sugar", color: colors.warning },
];

type Props = {
  totals: NutritionDayTotals;
  targets: NutritionTargets;
  onMacroPress?: (id: TodayMetricId) => void;
};

function Row({
  label,
  value,
  target,
  color,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  const ratio = target > 0 ? Math.min(1, Math.max(0, value / target)) : 0;
  const over = target > 0 && value > target;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const valueText = `${Math.round(value)} / ${Math.round(target)}g`;

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 14,
          fontWeight: "600",
          width: 64,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flex: 1,
          height: 6,
          borderRadius: 999,
          backgroundColor: colors.surfaceElevated,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            {
              height: "100%",
              borderRadius: 999,
              backgroundColor: over ? colors.error : color,
            },
            fillStyle,
          ]}
        />
      </View>
      <Text
        style={{
          color: over ? colors.error : colors.textSecondary,
          fontSize: 13,
          fontVariant: ["tabular-nums"],
          minWidth: 76,
          textAlign: "right",
        }}
      >
        {valueText}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {({ pressed }) => <View style={{ opacity: pressed ? 0.7 : 1 }}>{content}</View>}
    </Pressable>
  );
}

function MacroTriBarImpl({ totals, targets, onMacroPress }: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      {ROW_DEFS.map(({ key, metricId, label, color }) => {
        const value =
          key === "protein"
            ? totals.protein_g
            : key === "carbs"
            ? totals.carbs_g
            : key === "fat"
            ? totals.fat_g
            : totals.sugar_g;
        const target =
          key === "protein"
            ? targets.protein_g
            : key === "carbs"
            ? targets.carbs_g
            : key === "fat"
            ? targets.fat_g
            : targets.sugar_g;
        return (
          <Row
            key={key}
            label={label}
            value={value}
            target={target}
            color={color}
            onPress={onMacroPress ? () => onMacroPress(metricId) : undefined}
            accessibilityLabel={`${label}, ${Math.round(value)} of ${Math.round(target)} grams. Tap for detail.`}
          />
        );
      })}
    </View>
  );
}

export const MacroTriBar = memo(MacroTriBarImpl);
