import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MealCard } from "@/components/MealCard";
import { formatDayTotalsLine } from "@/components/NutritionRingsPanel";
import { Card } from "@/components/ui";
import type { NutritionDay } from "@/lib/api";
import { colors } from "@/theme/colors";

function chipLabel(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00`);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

type Props = {
  days: NutritionDay[];
  onMealPress: (id: string) => void;
  /** When set, day chips navigate instead of showing an inline summary card. */
  onDayPress?: (date: string) => void;
};

export function NutritionPastDays({ days, onMealPress, onDayPress }: Props) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");

  useEffect(() => {
    if (!days.length) {
      setSelectedDate("");
      return;
    }
    if (!days.some((d) => d.date === selectedDate)) {
      setSelectedDate(days[0].date);
    }
  }, [days, selectedDate]);

  if (!days.length) return null;

  const selected = days.find((d) => d.date === selectedDate) ?? days[0];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {days.map((d) => {
          const active = !onDayPress && d.date === selected.date;
          return (
            <Pressable
              key={d.date}
              onPress={() => (onDayPress ? onDayPress(d.date) : setSelectedDate(d.date))}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 22,
                  backgroundColor: active ? colors.surfaceElevated : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.spark : colors.border,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.textPrimary : colors.textSecondary,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {chipLabel(d.date)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {onDayPress ? null : (
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textSecondary, fontVariant: ["tabular-nums"] }}>
            {formatDayTotalsLine(selected.totals)}
          </Text>
          {selected.meals.length === 0 ? (
            <Text style={{ color: colors.textMuted, marginTop: 12, lineHeight: 22 }}>No meals logged this day.</Text>
          ) : (
            <View style={{ marginTop: 12 }}>
              {selected.meals.map((m) => (
                <MealCard key={m.id} meal={m} onPress={() => onMealPress(m.id)} />
              ))}
            </View>
          )}
        </Card>
      )}
    </View>
  );
}
