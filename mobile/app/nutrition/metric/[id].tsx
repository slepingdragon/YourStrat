import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { SourceLinkRow } from "@/components/SourceLinkRow";
import { TrendChart, type TrendPoint } from "@/components/nutrition/TrendChart";
import { BackHeader, Screen, SegmentedControl, Skeleton, toastError } from "@/components/ui";
import { getDailyMealTotals, type DailyTotalsPoint } from "@/lib/api";
import { isNutritionMetricId, METRIC_INFO } from "@/lib/nutritionMetricCopy";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import {
  formatMetricAmount,
  getMetricTarget,
  metricBalance,
  TODAY_METRIC_SPECS,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const RANGE_OPTIONS = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "1y", label: "1y", days: 365 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

const UNIT_SUFFIX: Record<"cal" | "g" | "mg", string> = {
  cal: "",
  g: "g",
  mg: "mg",
};

function formatLongDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  const now = new Date();
  const withYear = d.getFullYear() !== now.getFullYear();
  return d.toLocaleDateString(
    undefined,
    withYear
      ? { weekday: "short", month: "short", day: "numeric", year: "numeric" }
      : { weekday: "short", month: "short", day: "numeric" },
  );
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
        marginTop: spacing.xl,
        marginBottom: spacing.md,
      }}
    >
      {children}
    </Text>
  );
}

function Row({
  label,
  value,
  color = colors.textPrimary,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ color, fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

export default function NutritionMetricDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useStore((s) => s.profile);
  const targets = targetsFromProfile(profile);
  const metricId = id && isNutritionMetricId(id) ? id : null;
  const [range, setRange] = useState<RangeKey>("30d");
  const [dailyTotals, setDailyTotals] = useState<DailyTotalsPoint[]>([]);
  const [scrubPoint, setScrubPoint] = useState<TrendPoint | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyMealTotals(365);
      setDailyTotals(data.days);
    } catch (e) {
      console.error(e);
      toastError((e as Error).message, () => void load());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const metricKey = metricId ?? "calories";
  const info = METRIC_INFO[metricKey];
  const spec = TODAY_METRIC_SPECS[metricKey];
  const unitSuffix = UNIT_SUFFIX[spec.unit];
  const selectedRangeDays = RANGE_OPTIONS.find((o) => o.key === range)?.days ?? 30;
  const rangePoints = useMemo<TrendPoint[]>(() => {
    const slice = dailyTotals.slice(-selectedRangeDays);
    return slice.map((d) => ({
      date: d.date,
      value:
        metricKey === "calories"
          ? d.totals.calories
          : metricKey === "protein"
            ? d.totals.protein_g
            : metricKey === "carbs"
              ? d.totals.carbs_g
              : metricKey === "fat"
                ? d.totals.fat_g
                : metricKey === "fiber"
                  ? d.totals.fiber_g
                  : metricKey === "sugar"
                    ? d.totals.sugar_g
                    : d.totals.sodium_mg,
    }));
  }, [dailyTotals, metricKey, selectedRangeDays]);

  const target = targets ? getMetricTarget(targets, metricKey) : 0;
  const average = useMemo(() => {
    if (!rangePoints.length) return 0;
    const total = rangePoints.reduce((sum, p) => sum + p.value, 0);
    return total / rangePoints.length;
  }, [rangePoints]);

  const latest = rangePoints[rangePoints.length - 1] ?? null;
  const currentPoint = scrubPoint ?? latest;
  const consumed = currentPoint?.value ?? 0;
  const balance = metricBalance(consumed, target, spec.unit);
  const lineColor = metricBalance(latest?.value ?? 0, target, spec.unit).color;
  const avgDelta = consumed - average;
  const avgDeltaPrefix = avgDelta > 0 ? "+" : "";
  const periodHigh = rangePoints.reduce((max, p) => Math.max(max, p.value), 0);
  const periodLow = rangePoints.reduce((min, p) => Math.min(min, p.value), periodHigh);

  if (!metricId || !targets) {
    return (
      <Screen>
        <BackHeader title="Nutrition" />
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          {!metricId ? "Unknown metric." : "Complete onboarding to set your targets."}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen padding={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader title={info.title} />

        <View style={{ marginTop: spacing.md }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {scrubPoint ? "Scrubbed" : "Latest"}
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 52,
              fontWeight: "700",
              marginTop: spacing.xs,
              fontVariant: ["tabular-nums"],
              letterSpacing: -1,
            }}
          >
            {formatMetricAmount(consumed, spec.unit)}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs / 2 }}>
            {currentPoint ? formatLongDate(currentPoint.date) : "No data yet"}
          </Text>
          <Text
            style={{
              color: balance.color,
              fontSize: 14,
              fontWeight: "600",
              marginTop: spacing.sm,
            }}
          >
            {balance.text}
          </Text>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <SegmentedControl
            options={RANGE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
            value={range}
            onChange={(next) => {
              setRange(next as RangeKey);
              setScrubPoint(null);
            }}
          />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          {loading ? (
            <Skeleton height={280} radius={12} />
          ) : (
            <TrendChart
              data={rangePoints}
              target={target}
              avg={average}
              height={280}
              lineColor={lineColor}
              unitSuffix={unitSuffix}
              onScrubChange={setScrubPoint}
            />
          )}
        </View>

        <SectionLabel>Readout</SectionLabel>
        <Row label="vs target" value={balance.text} color={balance.color} />
        <Row
          label="vs period avg"
          value={`${avgDeltaPrefix}${formatMetricAmount(Math.abs(avgDelta), spec.unit)}`}
          color={avgDelta >= 0 ? colors.warning : colors.success}
        />
        <Row label="Period high" value={formatMetricAmount(periodHigh, spec.unit)} />
        <Row label="Period low" value={formatMetricAmount(periodLow, spec.unit)} />
        <Row label="Period average" value={formatMetricAmount(average, spec.unit)} />
        <Row label="Current target" value={formatMetricAmount(target, spec.unit)} color={colors.starDim} />

        <SectionLabel>What this is</SectionLabel>
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{info.about}</Text>
        <Text style={{ color: colors.textMuted, lineHeight: 20, marginTop: spacing.md, fontSize: 13 }}>
          {info.tip}
        </Text>

        {info.learnMore.length > 0 ? (
          <>
            <SectionLabel>Learn more</SectionLabel>
            {info.learnMore.map((source, index) => (
              <View key={source.url}>
                {index > 0 ? (
                  <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 40 }} />
                ) : null}
                <SourceLinkRow source={source} />
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
