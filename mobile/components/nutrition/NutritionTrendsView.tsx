import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BurnTrendRow } from "@/components/nutrition/BurnTrendRow";
import { NutrientTrendRow } from "@/components/nutrition/NutrientTrendRow";
import { ScoreStrip } from "@/components/nutrition/ScoreStrip";
import { NutritionPastDays } from "@/components/NutritionPastDays";
import { TrialBanner } from "@/components/TrialBanner";
import { Screen, Skeleton, toastError } from "@/components/ui";
import { getNutritionJournal, getSessionStats, type NutritionDay, type NutritionDayTotals, type SessionStats } from "@/lib/api";
import { computeSummaryStats } from "@/lib/nutritionSummaryStats";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import {
  ALL_TODAY_METRICS,
  getMetricTarget,
  getMetricValueFromTotals,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 420;
const TREND_ORDER: TodayMetricId[] = ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"];

const EMPTY_TOTALS: NutritionDayTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
};

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

function buildCalendarWindow(days: NutritionDay[]): NutritionDay[] {
  const byKey = new Map(days.map((d) => [d.date, d]));
  const today = new Date();
  const out: NutritionDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(byKey.get(key) ?? { date: key, meals: [], totals: { ...EMPTY_TOTALS } });
  }
  return out;
}

export function NutritionTrendsView() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const todaySnapshot = useStore((s) => s.today);
  const targets = targetsFromProfile(profile);
  const [days, setDays] = useState<NutritionDay[]>([]);
  const [burnStats, setBurnStats] = useState<SessionStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [journalOffline, setJournalOffline] = useState(false);
  const [journalLoaded, setJournalLoaded] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDay = useMemo(() => {
    const found = days.find((d) => d.date === todayKey);
    return found ?? { date: todayKey, meals: [], totals: { ...EMPTY_TOTALS } };
  }, [days, todayKey]);

  const pastDays = useMemo(() => days.filter((d) => d.date !== todayKey), [days, todayKey]);

  const stats = useMemo(() => computeSummaryStats(days, targets), [days, targets]);

  const window7 = useMemo(() => buildCalendarWindow(days), [days]);

  const valuesByMetric = useMemo(() => {
    const map: Record<TodayMetricId, number[]> = {} as Record<TodayMetricId, number[]>;
    for (const id of ALL_TODAY_METRICS) {
      map[id] = window7.map((d) => getMetricValueFromTotals(d.totals, id));
    }
    return map;
  }, [window7]);

  const session = useStore((s) => s.session);

  const load = useCallback(async () => {
    if (!session) return;
    const [journalRes, statsRes] = await Promise.allSettled([getNutritionJournal(), getSessionStats()]);
    if (journalRes.status === "fulfilled") {
      setDays(journalRes.value.days);
      setJournalOffline(false);
    } else {
      console.error(journalRes.reason);
      setJournalOffline(true);
      toastError((journalRes.reason as Error).message, () => void load());
    }
    if (statsRes.status === "fulfilled") {
      setBurnStats(statsRes.value);
    } else {
      console.error(statsRes.reason);
    }
    setJournalLoaded(true);
  }, [session]);

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

          <View style={{ marginBottom: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>
              TRENDS
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 2 }}>
              Last 7 days
            </Text>
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
                Finish onboarding to see your daily calorie + macro goals and start tracking trends.
              </Text>
            </View>
          ) : !journalLoaded ? (
            <View style={{ marginTop: 16 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Skeleton height={64} radius={16} />
                </View>
              ))}
            </View>
          ) : (
            <>
              {showStats ? (
                <View style={{ marginTop: 16 }}>
                  <ScoreStrip stats={stats} />
                </View>
              ) : null}

              <SectionLabel>By nutrient</SectionLabel>
              {TREND_ORDER.map((id) => (
                <NutrientTrendRow
                  key={id}
                  metricId={id}
                  values7d={valuesByMetric[id]}
                  today={getMetricValueFromTotals(todayDay.totals, id)}
                  target={getMetricTarget(targets, id)}
                  onPress={() =>
                    router.push({ pathname: "/nutrition/metric/[id]", params: { id } })
                  }
                />
              ))}

              {burnStats ? (
                <>
                  <SectionLabel>Workouts</SectionLabel>
                  <BurnTrendRow days={burnStats.burn_last_7_days} />
                </>
              ) : null}

              {pastDays.length > 0 ? (
                <>
                  <SectionLabel>Earlier days</SectionLabel>
                  <NutritionPastDays
                    days={pastDays}
                    onMealPress={(mealId) => router.push(`/meal/${mealId}`)}
                    onDayPress={(date) =>
                      router.push({ pathname: "/nutrition/day/[date]", params: { date } })
                    }
                  />
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
