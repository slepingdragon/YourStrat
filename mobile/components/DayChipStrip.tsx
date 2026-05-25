import { ScrollView, Text, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
    >
      {dayOrder.map((day) => {
        const active = day === activeDay;
        const isToday = day === todayIndex;
        return (
          <Pressable
            key={day}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(day);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${DAY_SHORT[day]}${isToday ? ", today" : ""}`}
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
                {isToday ? "Today" : DAY_SHORT[day]}
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
