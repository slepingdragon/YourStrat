import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { MealCard } from "@/components/MealCard";
import { Plus } from "@/components/icons";
import type { Meal } from "@/lib/api";
import {
  groupMealsBySlot,
  MEAL_SLOT_LABEL_KEYS,
  MEAL_SLOT_ORDER,
  type MealSlot,
} from "@/lib/nutritionSummaryStats";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  meals: Meal[];
  onMealPress: (id: string) => void;
  onLogPress: (slot: MealSlot) => void;
};

function slotCalTotal(meals: Meal[]): number {
  return meals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
}

function GhostRow({ slot, onPress }: { slot: MealSlot; onPress: () => void }) {
  const t = useT();
  const slotLabel = t(MEAL_SLOT_LABEL_KEYS[slot]).toLowerCase();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("nutrition.addSlot", { slot: slotLabel })}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.border,
        backgroundColor: "transparent",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Plus color={colors.textMuted} size={16} />
      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>
        {t("nutrition.addSlot", { slot: slotLabel })}
      </Text>
    </Pressable>
  );
}

function MealSlotsListImpl({ meals, onMealPress, onLogPress }: Props) {
  const t = useT();
  const groups = groupMealsBySlot(meals);

  return (
    <View style={{ gap: 18 }}>
      {MEAL_SLOT_ORDER.map((slot) => {
        const slotMeals = groups[slot];
        const cal = slotCalTotal(slotMeals);
        return (
          <View key={slot}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "700" }}>
                {t(MEAL_SLOT_LABEL_KEYS[slot])}
              </Text>
              {slotMeals.length > 0 ? (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {t("nutrition.slotCal", { kcal: formatKcal(cal) })}
                </Text>
              ) : null}
            </View>
            {slotMeals.length === 0 ? (
              <GhostRow slot={slot} onPress={() => onLogPress(slot)} />
            ) : (
              slotMeals.map((m) => (
                <MealCard key={m.id} meal={m} onPress={() => onMealPress(m.id)} />
              ))
            )}
          </View>
        );
      })}
    </View>
  );
}

export const MealSlotsList = memo(MealSlotsListImpl);
