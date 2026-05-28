import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BurnTrendRow } from "@/components/nutrition/BurnTrendRow";
import { NutrientTrendRow } from "@/components/nutrition/NutrientTrendRow";
import type { TrendPoint } from "@/components/nutrition/TrendChart";
import { ScoreStrip } from "@/components/nutrition/ScoreStrip";
import { TrendRangeToggle, type TrendRangeDays } from "@/components/nutrition/TrendRangeToggle";
import { NutritionPastDays } from "@/components/NutritionPastDays";
import { TrialBanner } from "@/components/TrialBanner";
import { Screen, Skeleton, toastError } from "@/components/ui";
import {
  getDailyMealTotals,
  getNutritionJournal,
  getSessionStats,
  type DailyTotalsPoint,
  type NutritionDay,
  type NutritionDayTotals,
  type SessionStats,
} from "@/lib/api";
import { useT } from "@/lib/i18n";
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
import { spacing } from "@/theme/spacing";

const CONTENT_MAX_WIDTH = 420;
const TREND_ORDER: TodayMetricId[] = ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"];
const MAX_TREND_FETCH = 30;
const DEFAULT_TREND_DAYS: TrendRangeDays = 7;

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

function buildTrendWindow(
  days: DailyTotalsPoint[],
  fallbackJournal: NutritionDay[],
  windowDays: number,
): DailyTotalsPoint[] {
  if (days.length > 0) {
    return days.slice(-windowDays);
  }
  const byDate = new Map(fallbackJournal.map((d) => [d.date, d.totals]));
  const today = new Date();
  const out: DailyTotalsPoint[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, totals: byDate.get(key) ?? { ...EMPTY_TOTALS } });
  }
  return out;
}

export function NutritionTrendsView() {
  const t = useT();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const todaySnapshot = useStore((s) => s.today);
  const targets = targetsFromProfile(profile);
  const [days, setDays] = useState<NutritionDay[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotalsPoint[]>([]);
  const [burnStats, setBurnStats] = useState<SessionStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [journalOffline, setJournalOffline] = useState(false);
  const [journalLoaded, setJournalLoaded] = useState(false);
  const [trendDays, setTrendDays] = useState<TrendRangeDays>(DEFAULT_TREND_DAYS);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDay = useMemo(() => {
    const found = days.find((d) => d.date === todayKey);
    return found ?? { date: todayKey, meals: [], totals: { ...EMPTY_TOTALS } };
  }, [days, todayKey]);

  const pastDays = useMemo(() => days.filter((d) => d.date !== todayKey), [days, todayKey]);
  const stats = useMemo(() => computeSummaryStats(days, targets), [days, targets]);
  const trendWindow = useMemo(
    () => buildTrendWindow(dailyTotals, days, trendDays),
    [dailyTotals, days, trendDays],
  );
  const periodLabel = `${trendDays}d`;

  const pointsByMetric = useMemo(() => {
    const map: Record<TodayMetricId, TrendPoint[]> = {} as Record<TodayMetricId, TrendPoint[]>;
    for (const id of ALL_TODAY_METRICS) {
      map[id] = trendWindow.map((d) => ({
        date: d.date,
        value: getMetricValueFromTotals(d.totals, id),
      }));
    }
    return map;
  }, [trendWindow]);

  const averageByMetric = useMemo(() => {
    const map: Record<TodayMetricId, number> = {} as Record<TodayMetricId, number>;
    for (const id of ALL_TODAY_METRICS) {
      const points = pointsByMetric[id];
      const total = points.reduce((sum, p) => sum + p.value, 0);
      map[id] = points.length > 0 ? total / points.length : 0;
    }
    return map;
  }, [pointsByMetric]);

  const session = useStore((s) => s.session);

  const load = useCallback(async () => {
    if (!session) return;
    const [journalRes, statsRes, dailyTotalsRes] = await Promise.allSettled([
      getNutritionJournal(),
      getSessionStats(),
      getDailyMealTotals(MAX_TREND_FETCH),
    ]);
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
    if (dailyTotalsRes.status === "fulfilled") {
      setDailyTotals(dailyTotalsRes.value.days);
    } else {
      console.error(dailyTotalsRes.reason);
    }
    setJournalLoaded(true);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />
        }
      >
        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
          <TrialBanner trial={trial} />

          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            {t("nutrition.trendsHeading")}
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: "700",
              marginTop: spacing.xs / 2,
              textAlign: "center",
            }}
          >
            {t("nutrition.lastNDays", { n: trendDays })}
          </Text>
          <TrendRangeToggle value={trendDays} onChange={setTrendDays} />

          {journalOffline ? (
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
              {t("nutrition.historyOutdated")}
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
                {t("nutrition.setupTargets")}
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
                {t("nutrition.finishOnboardingTrends")}
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

              <SectionLabel>{t("nutrition.byNutrient")}</SectionLabel>
              {TREND_ORDER.map((id) => (
                <NutrientTrendRow
                  key={id}
                  metricId={id}
                  points={pointsByMetric[id]}
                  today={
                    pointsByMetric[id][pointsByMetric[id].length - 1]?.value ??
                    getMetricValueFromTotals(todayDay.totals, id)
                  }
                  target={getMetricTarget(targets, id)}
                  avg={averageByMetric[id]}
                  periodLabel={periodLabel}
                  onPress={() =>
                    router.push({ pathname: "/nutrition/metric/[id]", params: { id } })
                  }
                />
              ))}

              {burnStats ? (
                <>
                  <SectionLabel>{t("nutrition.workouts")}</SectionLabel>
                  <BurnTrendRow days={burnStats.burn_last_7_days} />
                </>
              ) : null}

              {pastDays.length > 0 ? (
                <>
                  <SectionLabel>{t("nutrition.history")}</SectionLabel>
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
