import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import type { NutritionDay } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const DAY_ROW_HEIGHT = 64;

type Props = { day: NutritionDay; onPress: (date: string) => void };

function rowLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function TriBar({ p, c, f }: { p: number; c: number; f: number }) {
  const total = p + c + f;
  if (total <= 0) {
    return <View style={{ width: 52, height: 6, borderRadius: 999, backgroundColor: colors.surfaceElevated }} />;
  }
  return (
    <View style={{ flexDirection: "row", width: 52, height: 6, borderRadius: 999, overflow: "hidden" }}>
      <View style={{ flex: p, backgroundColor: colors.protein }} />
      <View style={{ flex: c, backgroundColor: colors.carbs }} />
      <View style={{ flex: f, backgroundColor: colors.fat }} />
    </View>
  );
}

/** One 64pt history row (N-S2, Story 6.3): date · kcal · macro tri-bar. */
function NutritionDayRowImpl({ day, onPress }: Props) {
  const empty = day.totals.calories <= 0;
  return (
    <Pressable
      onPress={() => onPress(day.date)}
      accessibilityRole="button"
      accessibilityLabel={`${rowLabel(day.date)}, ${formatKcal(day.totals.calories)} calories`}
      style={({ pressed }) => ({
        height: DAY_ROW_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.xs,
        opacity: pressed ? 0.7 : 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      })}
    >
      <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
        {rowLabel(day.date)}
      </Text>
      <Text
        style={{
          color: empty ? colors.textMuted : colors.textPrimary,
          fontSize: 16,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
      >
        {formatKcal(day.totals.calories)}
      </Text>
      <TriBar p={day.totals.protein_g} c={day.totals.carbs_g} f={day.totals.fat_g} />
    </Pressable>
  );
}

export const NutritionDayRow = memo(
  NutritionDayRowImpl,
  (prev, next) =>
    prev.day.date === next.day.date &&
    prev.day.totals.calories === next.day.totals.calories &&
    prev.day.totals.protein_g === next.day.totals.protein_g &&
    prev.day.totals.carbs_g === next.day.totals.carbs_g &&
    prev.day.totals.fat_g === next.day.totals.fat_g
);
