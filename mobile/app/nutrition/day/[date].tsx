import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Screen, toastError } from "@/components/ui";
import { X } from "@/components/icons";
import { getNutritionJournal, type Meal, type NutritionDay } from "@/lib/api";
import { formatKcal, formatMacroGrams } from "@/lib/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const EMPTY_TOTALS = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 };

function dayHeading(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function mealName(meal: Meal): string {
  return meal.items?.slice(0, 2).map((i) => i.name).join(", ") || "Meal";
}

export default function NutritionDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const [day, setDay] = useState<NutritionDay | null>(null);
  const loadErrorShown = useRef(false);

  const load = useCallback(async () => {
    if (!date) return;
    try {
      const data = await getNutritionJournal();
      const found = data.days.find((d) => d.date === date);
      setDay(found ?? { date, meals: [], totals: { ...EMPTY_TOTALS } });
    } catch (e) {
      console.error(e);
      if (!loadErrorShown.current) {
        loadErrorShown.current = true;
        toastError((e as Error).message);
      }
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const title = useMemo(() => (date ? dayHeading(date) : "Day"), [date]);
  const totals = day?.totals ?? EMPTY_TOTALS;
  const meals = day?.meals ?? [];

  return (
    <Screen>
      {/* Grabber + close (no title bar) — swipe-down dismisses on iOS; the X
          covers Android / explicit dismiss. */}
      <View style={{ alignItems: "center", marginBottom: spacing.sm }}>
        <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: colors.border }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 28, fontWeight: "700", lineHeight: 34 }}>
          {date ? title : "Missing date"}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: pressed ? colors.surface : "transparent",
            marginLeft: spacing.md,
          })}
        >
          <X color={colors.textMuted} size={18} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, marginTop: spacing.lg }} showsVerticalScrollIndicator={false}>
        {meals.length === 0 ? (
          <Text style={{ color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm }}>
            No meals logged this day.
          </Text>
        ) : (
          meals.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push(`/meal/${m.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${mealName(m)}, ${formatKcal(m.total_calories)} calories`}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 15 }} numberOfLines={1}>
                {mealName(m)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontVariant: ["tabular-nums"] }}>
                {formatKcal(m.total_calories)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Bottom-anchored totals (receipt) */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Total
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
            {formatKcal(totals.calories)} cal
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 14, fontVariant: ["tabular-nums"], marginTop: spacing.xs, textAlign: "right" }}>
          P {formatMacroGrams(totals.protein_g)}g · C {formatMacroGrams(totals.carbs_g)}g · F {formatMacroGrams(totals.fat_g)}g
        </Text>
      </View>
    </Screen>
  );
}
