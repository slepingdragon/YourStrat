import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { CalorieHero } from "@/components/nutrition/CalorieHero";
import { MacroTriBar } from "@/components/nutrition/MacroTriBar";
import { MealSlotsList } from "@/components/nutrition/MealSlotsList";
import { MicroPinBar } from "@/components/nutrition/MicroPinBar";
import { ScoreStrip } from "@/components/nutrition/ScoreStrip";
import { TrialBanner } from "@/components/TrialBanner";
import { Button, Screen, Skeleton, toastError } from "@/components/ui";
import { getNutritionJournal, type NutritionDay, type NutritionDayTotals } from "@/lib/api";
import {
  classifyMealSlot,
  computeSummaryStats,
  MEAL_SLOT_LABELS,
  MEAL_SLOT_ORDER,
  type MealSlot,
} from "@/lib/nutritionSummaryStats";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import type { TodayMetricId } from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 420;

const EMPTY_TOTALS: NutritionDayTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
};

function todayDateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginTop: 28,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}

const EMPTY_STATE_CTA_COPY: Record<MealSlot, string> = {
  breakfast: "Log breakfast",
  lunch: "Log lunch",
  dinner: "Log dinner",
  snack: "Log a snack",
};

function MealsEmptyState({ onLogPress }: { onLogPress: () => void }) {
  const currentSlot = classifyMealSlot(new Date().toISOString());

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {MEAL_SLOT_ORDER.map((slot) => {
          const active = slot === currentSlot;
          return (
            <Pressable
              key={slot}
              onPress={onLogPress}
              accessibilityRole="button"
              accessibilityLabel={`Log ${MEAL_SLOT_LABELS[slot].toLowerCase()}${active ? ", right now" : ""}`}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 8,
                borderRadius: 999,
                alignItems: "center",
                backgroundColor: active ? `${colors.spark}1A` : "transparent",
                borderWidth: 1,
                borderColor: active ? colors.spark : colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  color: active ? colors.spark : colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
                numberOfLines={1}
              >
                {MEAL_SLOT_LABELS[slot]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button label={EMPTY_STATE_CTA_COPY[currentSlot]} onPress={onLogPress} compact />
    </View>
  );
}

export function NutritionDayView() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const todaySnapshot = useStore((s) => s.today);
  const targets = targetsFromProfile(profile);
  const [days, setDays] = useState<NutritionDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [journalOffline, setJournalOffline] = useState(false);
  const [journalLoaded, setJournalLoaded] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDay = useMemo(() => {
    const found = days.find((d) => d.date === todayKey);
    return found ?? { date: todayKey, meals: [], totals: { ...EMPTY_TOTALS } };
  }, [days, todayKey]);

  const stats = useMemo(() => computeSummaryStats(days, targets), [days, targets]);

  const openMetric = useCallback(
    (id: TodayMetricId) => router.push({ pathname: "/nutrition/metric/[id]", params: { id } }),
    [router]
  );

  const load = useCallback(async () => {
    try {
      const data = await getNutritionJournal();
      setDays(data.days);
      setJournalOffline(false);
    } catch (e) {
      console.error(e);
      setJournalOffline(true);
      toastError((e as Error).message, () => void load());
    } finally {
      setJournalLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const burnedToday = todaySnapshot?.burned_calories ?? 0;
  const showStats =
    stats.streakDays > 0 ||
    stats.proteinHitRate.total > 0 ||
    stats.onTargetDays.total > 0 ||
    stats.avgCalories7d != null;

  const trial = profile?.trial ?? todaySnapshot?.targets?.trial;

  return (
    <Screen padding={false}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 56, alignItems: "center" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />
        }
      >
        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
          <TrialBanner trial={trial} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>
                TODAY
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 2 }}>
                {todayDateLabel()}
              </Text>
            </View>
            {stats.streakDays > 0 ? (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.spark,
                  backgroundColor: `${colors.spark}1A`,
                }}
              >
                <Text style={{ color: colors.spark, fontSize: 13, fontWeight: "700" }}>
                  {stats.streakDays}-day streak
                </Text>
              </View>
            ) : null}
          </View>

          {journalOffline ? (
            <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12, lineHeight: 18 }}>
              Meal history may be outdated — pull to refresh when you&apos;re back online.
            </Text>
          ) : null}

          {!targets ? (
            <View style={{ marginTop: 40, alignItems: "center" }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Set up your targets first
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 20,
                  maxWidth: 300,
                }}
              >
                Finish onboarding to see your daily calorie + macro goals and start tracking meals.
              </Text>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 16 }}>
                <CalorieHero
                  consumed={todayDay.totals.calories}
                  burned={burnedToday}
                  target={targets.calories}
                  onPress={() => openMetric("calories")}
                />
              </View>

              <View style={{ marginTop: 16 }}>
                <MacroTriBar
                  totals={todayDay.totals}
                  targets={targets}
                  onMacroPress={openMetric}
                />
              </View>

              {showStats ? (
                <>
                  <SectionLabel>This week</SectionLabel>
                  <ScoreStrip stats={stats} />
                </>
              ) : null}

              <SectionLabel>Watch &amp; reach</SectionLabel>
              <View style={{ gap: 4 }}>
                <MicroPinBar
                  label="Fiber"
                  value={todayDay.totals.fiber_g}
                  target={targets.fiber_g}
                  unit="g"
                  color={colors.success}
                  tone="goal"
                  onPress={() => openMetric("fiber")}
                />
                <MicroPinBar
                  label="Sodium"
                  value={todayDay.totals.sodium_mg}
                  target={targets.sodium_mg}
                  unit="mg"
                  color={colors.spark}
                  tone="limit"
                  onPress={() => openMetric("sodium")}
                />
              </View>

              <SectionLabel>Meals</SectionLabel>
              {!journalLoaded ? (
                <View>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={{ marginBottom: 12 }}>
                      <Skeleton height={56} radius={12} />
                    </View>
                  ))}
                </View>
              ) : todayDay.meals.length === 0 ? (
                <MealsEmptyState onLogPress={() => router.push("/(tabs)/scan")} />
              ) : (
                <MealSlotsList
                  meals={todayDay.meals}
                  onMealPress={(id) => router.push(`/meal/${id}`)}
                  onLogPress={() => router.push("/(tabs)/scan")}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
