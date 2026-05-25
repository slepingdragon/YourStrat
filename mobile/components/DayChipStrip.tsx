import { ScrollView, Text, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

const DAY_SHORT_KEYS = [
  "workout.dayShort.sun",
  "workout.dayShort.mon",
  "workout.dayShort.tue",
  "workout.dayShort.wed",
  "workout.dayShort.thu",
  "workout.dayShort.fri",
  "workout.dayShort.sat",
] as const;

type Props = {
  /** Day indices (0=Sun) in display order — typically today first. */
  dayOrder: number[];
  todayIndex: number;
  activeDay: number;
  onSelect: (day: number) => void;
};

/**
 * Week-at-a-glance day strip (UX-DR16, W-S1). Horizontal chips ordered from
 * today; the active chip is filled and today carries a small accent dot so it
 * stays findable after you tap elsewhere. Tapping scrolls the list to that day.
 */
export function DayChipStrip({ dayOrder, todayIndex, activeDay, onSelect }: Props) {
  const t = useT();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
    >
      {dayOrder.map((day) => {
        const active = day === activeDay;
        const isToday = day === todayIndex;
        const dayShort = t(DAY_SHORT_KEYS[day]);
        return (
          <Pressable
            key={day}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(day);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={isToday ? t("workout.chipTodayA11y", { day: dayShort }) : dayShort}
            style={{
              paddingHorizontal: spacing.lg,
              height: 36,
              borderRadius: radius.pill,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: active ? colors.star : colors.border,
              backgroundColor: active ? colors.star : colors.surface,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <Text
                style={{
                  color: active ? colors.bg : colors.textPrimary,
                  fontSize: 13,
                  fontWeight: active ? "700" : "500",
                }}
              >
                {isToday ? t("workout.today") : dayShort}
              </Text>
              {isToday && !active ? (
                <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: colors.spark }} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
