import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View, type ViewToken } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BurnTrendRow } from "@/components/nutrition/BurnTrendRow";
import { CalorieHeatmapStrip } from "@/components/nutrition/CalorieHeatmapStrip";
import { NutritionDayRow } from "@/components/nutrition/NutritionDayRow";
import { NutritionHero } from "@/components/nutrition/NutritionHero";
import { ScoreStrip } from "@/components/nutrition/ScoreStrip";
import { TrialBanner } from "@/components/TrialBanner";
import { Screen, Skeleton, toastError } from "@/components/ui";
import { getNutritionJournal, getSessionStats, type NutritionDay, type NutritionDayTotals, type SessionStats } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { computeSummaryStats } from "@/lib/nutritionSummaryStats";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import { getMetricTarget } from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

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
  const t = useT();
  const profile = useStore((s) => s.profile);
  const todaySnapshot = useStore((s) => s.today);
  const session = useStore((s) => s.session);
  // Memoized so the heatmap/score (which take `targets`) keep their memo while
  // the sticky-month chip updates state on scroll.
  const targets = useMemo(() => targetsFromProfile(profile), [profile]);

  const [days, setDays] = useState<NutritionDay[]>([]);
  const [vsAvgKcal, setVsAvgKcal] = useState<number | null>(null);
  const [burnStats, setBurnStats] = useState<SessionStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [journalOffline, setJournalOffline] = useState(false);
  const [journalLoaded, setJournalLoaded] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDay = useMemo(() => {
    const found = days.find((d) => d.date === todayKey);
    return found ?? { date: todayKey, meals: [], totals: { ...EMPTY_TOTALS } };
  }, [days, todayKey]);

  const pastDays = useMemo(() => days.filter((d) => d.date !== todayKey), [days, todayKey]);
  const stats = useMemo(() => computeSummaryStats(days, targets), [days, targets]);
  const window7 = useMemo(() => buildCalendarWindow(days), [days]);
  const caloriesValues = useMemo(() => window7.map((d) => d.totals.calories), [window7]);

  const load = useCallback(async () => {
    if (!session) return;
    const [journalRes, statsRes] = await Promise.allSettled([getNutritionJournal(), getSessionStats()]);
    if (journalRes.status === "fulfilled") {
      setDays(journalRes.value.days);
      setVsAvgKcal(journalRes.value.vs_avg_kcal);
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

  // Sticky month chip — track the topmost visible day row (refs so the FlatList
  // callback identity stays stable across renders).
  const onViewRef = useRef((info: { viewableItems: ViewToken[] }) => {
    const first = info.viewableItems.find((v) => v.isViewable && v.item);
    if (!first) {
      setVisibleMonth(null);
      return;
    }
    const d = new Date(`${(first.item as NutritionDay).date}T12:00:00`);
    setVisibleMonth(d.toLocaleDateString(undefined, { month: "long", year: "numeric" }));
  });
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 50 });

  const showStats =
    stats.streakDays > 0 ||
    stats.proteinHitRate.total > 0 ||
    stats.onTargetDays.total > 0 ||
    stats.avgCalories7d != null;

  const trial = profile?.trial ?? todaySnapshot?.targets?.trial;

  // --- States that don't use the virtualized list ---
  if (!targets) {
    return (
      <Screen padding={false}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
            <TrialBanner trial={trial} />
            <View style={{ marginTop: 40, alignItems: "center" }}>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", textAlign: "center" }}>
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
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (!journalLoaded) {
    return (
      <Screen padding={false}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
            <TrialBanner trial={trial} />
            <View style={{ marginTop: 16 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Skeleton height={64} radius={16} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const ListHeader = (
    <View>
      <TrialBanner trial={trial} />

      <NutritionHero
        todayKcal={todayDay.totals.calories}
        target={getMetricTarget(targets, "calories")}
        sparklineValues={caloriesValues}
        protein={todayDay.totals.protein_g}
        carbs={todayDay.totals.carbs_g}
        fat={todayDay.totals.fat_g}
        vsAvgKcal={vsAvgKcal}
      />

      {journalOffline ? (
        <Text style={{ color: colors.textMuted, marginBottom: 8, fontSize: 12, lineHeight: 18 }}>
          {t("nutrition.historyOutdated")}
        </Text>
      ) : null}

      {showStats ? <ScoreStrip stats={stats} /> : null}

      <SectionLabel>{t("nutrition.thisWeek")}</SectionLabel>
      <CalorieHeatmapStrip days={window7} targets={targets} todayKey={todayKey} />

      {burnStats ? (
        <>
          <SectionLabel>{t("nutrition.workouts")}</SectionLabel>
          <BurnTrendRow days={burnStats.burn_last_7_days} />
        </>
      ) : null}

      <SectionLabel>{t("nutrition.history")}</SectionLabel>
    </View>
  );

  return (
    <Screen padding={false}>
      <View style={{ flex: 1, width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center" }}>
        <FlatList
          data={pastDays}
          keyExtractor={(d) => d.date}
          renderItem={({ item }) => (
            <NutritionDayRow
              day={item}
              onPress={(date) => router.push({ pathname: "/nutrition/day/[date]", params: { date } })}
            />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, fontSize: 14, paddingVertical: spacing.sm }}>
              {t("nutrition.noEarlierDays")}
            </Text>
          }
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 56 }}
        />
        {visibleMonth ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 8,
              alignSelf: "center",
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>{visibleMonth}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
