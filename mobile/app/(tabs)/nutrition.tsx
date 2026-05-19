import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MealCard } from "@/components/MealCard";
import { NutritionPastDays } from "@/components/NutritionPastDays";
import { NutritionRingsPanel } from "@/components/NutritionRingsPanel";
import { Button, Card, Screen, toastError } from "@/components/ui";
import { getNutritionJournal, type NutritionDay, type NutritionDayTotals } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import { roundCal, roundG } from "@/lib/targets";
import {
  formatMetricAmount,
  getMetricTarget,
  getMetricValueFromTotals,
  TODAY_METRIC_SPECS,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 400;

const EMPTY_TOTALS: NutritionDayTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
};

const MORE_METRICS: TodayMetricId[] = ["sugar", "sodium", "fiber"];

const SCAN_TIPS = [
  "Fill the frame with your whole plate for better estimates.",
  "Bright, even lighting helps read portions and labels.",
];

function whatsLeftLine(totals: NutritionDayTotals, targets: NutritionTargets) {
  const calLeft = targets.calories - totals.calories;
  const proteinLeft = targets.protein_g - totals.protein_g;
  const calPart =
    calLeft > 5
      ? `${roundCal(calLeft).toLocaleString()} cal left`
      : calLeft < -5
        ? `${roundCal(Math.abs(calLeft)).toLocaleString()} cal over`
        : "Calories on target";
  const proteinPart =
    proteinLeft > 0.5
      ? `${roundG(proteinLeft)}g protein left`
      : proteinLeft < -0.5
        ? `${roundG(Math.abs(proteinLeft))}g protein over`
        : "Protein on target";
  return `${calPart} · ${proteinPart}`;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 15,
        marginTop: 28,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}

function MetricRow({
  id,
  totals,
  targets,
  onPress,
  isLast,
}: {
  id: TodayMetricId;
  totals: NutritionDayTotals;
  targets: NutritionTargets;
  onPress: () => void;
  isLast?: boolean;
}) {
  const spec = TODAY_METRIC_SPECS[id];
  const value = getMetricValueFromTotals(totals, id);
  const target = getMetricTarget(targets, id);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${spec.label} details`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        flexDirection: "row",
        alignItems: "stretch",
        marginBottom: isLast ? 0 : 10,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <View style={{ width: 5, backgroundColor: spec.color }} />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: "600", fontSize: 15 }}>{spec.label}</Text>
        <Text style={{ color: colors.textSecondary, fontVariant: ["tabular-nums"], fontSize: 14 }}>
          {formatMetricAmount(value, spec.unit)}
          <Text style={{ color: colors.textMuted }}> / {formatMetricAmount(target, spec.unit)}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

function QuickWinCard({
  title,
  body,
  accent,
  onPress,
  primary,
}: {
  title: string;
  body: string;
  accent: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  const inner = (
    <Card
      style={{
        width: 168,
        minHeight: 108,
        backgroundColor: primary ? colors.surfaceElevated : colors.surface,
        borderColor: primary ? accent : colors.border,
        padding: 14,
        justifyContent: "space-between",
      }}
    >
      <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: accent, marginBottom: 10 }} />
      <Text style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 15 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 6 }}>{body}</Text>
    </Card>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => <View style={{ opacity: pressed ? 0.88 : 1 }}>{inner}</View>}
    </Pressable>
  );
}

export default function NutritionScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const targets = targetsFromProfile(profile);
  const [days, setDays] = useState<NutritionDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [journalOffline, setJournalOffline] = useState(false);
  const [scanTipsOpen, setScanTipsOpen] = useState(false);
  const loadErrorShown = useRef(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDay = useMemo(() => {
    const found = days.find((d) => d.date === todayKey);
    return found ?? { date: todayKey, meals: [], totals: { ...EMPTY_TOTALS } };
  }, [days, todayKey]);

  const pastDays = useMemo(() => days.filter((d) => d.date !== todayKey), [days, todayKey]);

  const leftSummary = useMemo(
    () => (targets ? whatsLeftLine(todayDay.totals, targets) : ""),
    [targets, todayDay.totals]
  );

  const openMetric = (id: TodayMetricId) =>
    router.push({ pathname: "/nutrition/metric/[id]", params: { id } });

  const load = useCallback(async () => {
    try {
      const data = await getNutritionJournal();
      setDays(data.days);
      setJournalOffline(false);
    } catch (e) {
      console.error(e);
      setJournalOffline(true);
      if (!loadErrorShown.current) {
        loadErrorShown.current = true;
        toastError((e as Error).message);
      }
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

  return (
    <Screen padding={false}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48, alignItems: "center" }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />}
      >
        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
          <View
            style={{
              borderLeftWidth: 3,
              borderLeftColor: colors.spark,
              paddingLeft: 16,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>
              Your nutrition
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, lineHeight: 22, fontSize: 16 }}>
              Know what you&apos;re eating — one tap at a time.
            </Text>
          </View>

          {journalOffline ? (
            <Text style={{ color: colors.textMuted, marginTop: 12, lineHeight: 20, fontSize: 13 }}>
              Meal history may be outdated — pull to refresh when you&apos;re back online.
            </Text>
          ) : null}

          {!targets ? (
            <Text style={{ color: colors.textSecondary, marginTop: 24, lineHeight: 22 }}>
              Complete onboarding to set your targets and track meals here.
            </Text>
          ) : (
            <>
              <SectionTitle>At a glance</SectionTitle>
              <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
                <NutritionRingsPanel
                  totals={todayDay.totals}
                  targets={targets}
                  primaryOnly
                  onMetricPress={openMetric}
                />
              </Card>

              <SectionTitle>Quick wins</SectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingVertical: 2 }}
              >
                <QuickWinCard
                  title="Log food"
                  body="Snap a plate — we estimate calories and macros."
                  accent={colors.spark}
                  primary
                  onPress={() => router.push("/(tabs)/scan")}
                />
                <QuickWinCard
                  title="What's left today"
                  body={leftSummary}
                  accent={colors.success}
                  onPress={() => openMetric("calories")}
                />
                <QuickWinCard
                  title="AI scan tips"
                  body={scanTipsOpen ? SCAN_TIPS[1] : SCAN_TIPS[0]}
                  accent={colors.starDim}
                  onPress={() => setScanTipsOpen((v) => !v)}
                />
              </ScrollView>

              <SectionTitle>More nutrients</SectionTitle>
              <View style={{ gap: 0 }}>
                {MORE_METRICS.map((id, index) => (
                  <MetricRow
                    key={id}
                    id={id}
                    totals={todayDay.totals}
                    targets={targets}
                    onPress={() => openMetric(id)}
                    isLast={index === MORE_METRICS.length - 1}
                  />
                ))}
              </View>

              <SectionTitle>Today&apos;s meals</SectionTitle>
              {todayDay.meals.length === 0 ? (
                <Card style={{ alignItems: "center", paddingVertical: 20 }}>
                  <Text style={{ color: colors.textMuted, lineHeight: 22, textAlign: "center" }}>
                    No meals yet. Log food to build your day.
                  </Text>
                  <View style={{ width: "100%", maxWidth: 220, marginTop: 16 }}>
                    <Button label="Log food" onPress={() => router.push("/(tabs)/scan")} />
                  </View>
                </Card>
              ) : (
                todayDay.meals.map((m) => (
                  <MealCard key={m.id} meal={m} onPress={() => router.push(`/meal/${m.id}`)} />
                ))
              )}

              {pastDays.length > 0 ? (
                <>
                  <SectionTitle>Earlier days</SectionTitle>
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
