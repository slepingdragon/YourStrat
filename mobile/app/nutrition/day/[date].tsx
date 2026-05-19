import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { MealCard } from "@/components/MealCard";
import { NutritionRingsPanel, formatDayTotalsLine } from "@/components/NutritionRingsPanel";
import { Card, Screen, BackHeader, toastError } from "@/components/ui";
import { getNutritionJournal, type NutritionDay } from "@/lib/api";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

function dayHeading(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function NutritionDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const targets = targetsFromProfile(profile);
  const [day, setDay] = useState<NutritionDay | null>(null);
  const loadErrorShown = useRef(false);

  const load = useCallback(async () => {
    if (!date) return;
    try {
      const data = await getNutritionJournal();
      const found = data.days.find((d) => d.date === date);
      setDay(found ?? { date, meals: [], totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 } });
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

  if (!date) {
    return (
      <Screen>
        <BackHeader title="Day" />
        <Text style={{ color: colors.textSecondary }}>Missing date.</Text>
      </Screen>
    );
  }

  const totals = day?.totals;
  const meals = day?.meals ?? [];

  return (
    <Screen padding={false}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <BackHeader title={title} />

        {totals ? (
          <Card style={{ marginTop: 8 }}>
            <Text style={{ color: colors.textSecondary, fontVariant: ["tabular-nums"], marginBottom: targets ? 16 : 0 }}>
              {formatDayTotalsLine(totals)}
            </Text>
            {targets ? <NutritionRingsPanel totals={totals} targets={targets} primaryOnly /> : null}
          </Card>
        ) : null}

        <Text style={{ color: colors.textPrimary, fontWeight: "600", marginTop: 28, marginBottom: 12 }}>Meals</Text>
        {meals.length === 0 ? (
          <Text style={{ color: colors.textMuted, lineHeight: 22 }}>No meals logged this day.</Text>
        ) : (
          meals.map((m) => <MealCard key={m.id} meal={m} onPress={() => router.push(`/meal/${m.id}`)} />)
        )}
      </ScrollView>
    </Screen>
  );
}
