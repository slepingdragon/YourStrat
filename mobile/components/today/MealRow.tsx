import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { Meal } from "@/lib/api";
import { ChevronRight } from "@/components/icons";
import { formatKcal, formatMacroGrams } from "@/lib/format";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

type Props = { meal: Meal; onOpen: () => void };

/** 8pt P/C/F split bar, proportional to the meal's macro grams (T-C2). */
function MacroTriBar({ p, c, f }: { p: number; c: number; f: number }) {
  const total = p + c + f;
  if (total <= 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        width: 44,
        height: 8,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: colors.surfaceElevated,
      }}
      accessibilityElementsHidden
    >
      <View style={{ flex: p, backgroundColor: colors.protein }} />
      <View style={{ flex: c, backgroundColor: colors.carbs }} />
      <View style={{ flex: f, backgroundColor: colors.fat }} />
    </View>
  );
}

/**
 * Today's compact meal row (T-C2 + T-A1): single line (name · kcal · P/C/F
 * tri-bar) that expands on tap to items + macros + an Open link to the meal
 * detail. Springs into the list on mount (`entering`, reduce-motion-respecting)
 * so a newly-scanned meal animates in. Distinct from the Nutrition `MealCard`
 * (photo card that navigates) — different surface, different interaction.
 */
function MealRowImpl({ meal, onOpen }: Props) {
  const [expanded, setExpanded] = useState(false);
  const top = meal.items?.slice(0, 2).map((i) => i.name).join(", ") || "Meal";

  return (
    <Animated.View entering={FadeInDown.duration(320)} style={{ marginBottom: spacing.sm }}>
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${top}, ${formatKcal(meal.total_calories)} calories. ${expanded ? "Collapse" : "Expand"}.`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
        })}
      >
        <Text style={{ flexShrink: 1, color: colors.textPrimary, fontWeight: "600", fontSize: 15 }} numberOfLines={1}>
          {top}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ color: colors.textSecondary, fontSize: 13, fontVariant: ["tabular-nums"] }}>
          {formatKcal(meal.total_calories)} cal
        </Text>
        <MacroTriBar p={meal.total_protein_g} c={meal.total_carbs_g} f={meal.total_fat_g} />
      </Pressable>

      {expanded ? (
        <View
          style={{
            marginTop: spacing.xs,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          {meal.items?.length
            ? meal.items.map((it, i) => (
                <View key={it.id ?? i} style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.sm }}>
                  <Text style={{ flexShrink: 1, color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>
                    {it.name}
                    {it.portion ? ` · ${it.portion}` : ""}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] }}>
                    {formatKcal(it.calories)} cal
                  </Text>
                </View>
              ))
            : null}
          <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"], marginTop: spacing.xs }}>
            P {formatMacroGrams(meal.total_protein_g)}g · C {formatMacroGrams(meal.total_carbs_g)}g · F{" "}
            {formatMacroGrams(meal.total_fat_g)}g
          </Text>
          <Pressable
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel="Open meal details"
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
              alignSelf: "flex-start",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: colors.spark, fontSize: 13, fontWeight: "600" }}>Open</Text>
            <ChevronRight color={colors.spark} size={16} />
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}

export const MealRow = memo(
  MealRowImpl,
  (prev, next) =>
    prev.meal.id === next.meal.id &&
    prev.meal.total_calories === next.meal.total_calories &&
    prev.meal.total_protein_g === next.meal.total_protein_g &&
    prev.meal.total_carbs_g === next.meal.total_carbs_g &&
    prev.meal.total_fat_g === next.meal.total_fat_g &&
    (prev.meal.items?.length ?? 0) === (next.meal.items?.length ?? 0)
);
