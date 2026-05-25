import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { IntakeRing } from "@/components/IntakeRing";
import { MealRow } from "@/components/today/MealRow";
import { CalorieSparkline } from "@/components/today/CalorieSparkline";
import { NextActionButton } from "@/components/today/NextActionButton";
import { TodayHeader } from "@/components/today/TodayHeader";
import { WorkoutCard } from "@/components/today/WorkoutCard";
import { NutrientGrid } from "@/components/today/NutrientGrid";
import { CustomizeTodaySheet } from "@/components/today/CustomizeTodaySheet";
import { Settings } from "@/components/icons";
import type { Meal, NutritionDay, Profile, Routine, TodaySnapshot } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { resolvePace, type PaceState } from "@/lib/pace";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import {
  DEFAULT_TODAY_LAYOUT,
  loadTodayLayout,
  saveTodayLayout,
  visibleSections,
  type TodayLayout,
  type TodaySectionId,
} from "@/lib/todayLayout";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const CONTENT_MAX_WIDTH = 400;
const RING_SIZE = 132; // T-M1: ring is a compact pace "crown"; the number is the hero below it

type Props = {
  today: TodaySnapshot | null;
  profile: Profile | null;
  routines: Routine[] | null;
  journalDays: NutritionDay[] | null;
};

function formatHeroNumber(n: number) {
  return formatKcal(Math.abs(n));
}

function pacePhraseKey(state: PaceState): string {
  switch (state) {
    case "on":
      return "pace.on";
    case "behind":
      return "pace.behind";
    case "ahead":
      return "pace.ahead";
    case "over":
      return "pace.over";
  }
}

export function TodayDashboard({ today, profile, routines, journalDays }: Props) {
  const router = useRouter();
  const tr = useT();
  const t = today?.targets ?? profile;
  const empty = !today?.meals?.length;

  const hero = today
    ? {
        value: formatHeroNumber(today.remaining_calories),
        label:
          today.remaining_calories < 0
            ? tr("today.caloriesOver")
            : Math.abs(today.remaining_calories) <= 5
              ? tr("today.atTarget")
              : tr("today.caloriesLeft"),
        over: today.remaining_calories < 0,
        consumed: today.consumed_calories,
        burned: today.burned_calories,
        target: today.targets?.daily_calorie_target ?? 0,
        // Effective target = base + burned, so a finished workout grows headroom
        // and the ring fill / pace state move in lockstep (precedent §3, §7).
        effectiveTarget: (today.targets?.daily_calorie_target ?? 0) + today.burned_calories,
      }
    : null;

  const pace = today
    ? resolvePace({
        now: new Date(),
        serverPacePosition: today.pace_position,
        consumedCalories: today.consumed_calories,
        target: today.targets?.daily_calorie_target ?? 0,
        burnedCalories: today.burned_calories,
      })
    : null;

  const mealsTotalCal = useMemo(() => {
    if (!today?.meals?.length) return 0;
    return today.meals.reduce((s, m) => s + (m.total_calories ?? 0), 0);
  }, [today?.meals]);

  const [layout, setLayout] = useState<TodayLayout>(DEFAULT_TODAY_LAYOUT);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  useEffect(() => {
    loadTodayLayout()
      .then(setLayout)
      .catch(() => {});
  }, []);

  const gridTargets = targetsFromProfile(t);

  const mealsBlock = (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: spacing.md,
          justifyContent: empty ? "center" : "space-between",
        }}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{tr("meal.section")}</Text>
        {!empty ? (
          <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] }}>
            {tr("meal.loggedSummary", { n: today!.meals.length, kcal: formatKcal(mealsTotalCal) })}
          </Text>
        ) : null}
      </View>
      {empty ? (
        <Text style={{ color: colors.textMuted, lineHeight: 22, textAlign: "center" }}>{tr("meal.noneToday")}</Text>
      ) : (
        today?.meals.map((m: Meal) => <MealRow key={m.id} meal={m} onOpen={() => router.push(`/meal/${m.id}`)} />)
      )}
    </>
  );

  const renderSection = (id: TodaySectionId) => {
    switch (id) {
      case "nutrients":
        return today && gridTargets ? (
          <View style={{ marginBottom: spacing.lg }}>
            <NutrientGrid
              today={today}
              targets={gridTargets}
              metrics={layout.metrics}
              onCustomize={() => setCustomizeOpen(true)}
            />
          </View>
        ) : null;
      case "workout":
        return today ? (
          <View style={{ marginBottom: spacing.lg }}>
            <WorkoutCard today={today} />
          </View>
        ) : null;
      case "trend":
        return journalDays && journalDays.length >= 2 ? (
          <View style={{ marginBottom: spacing.lg }}>
            <CalorieSparkline days={journalDays} target={t?.daily_calorie_target ?? 0} />
          </View>
        ) : null;
      case "effort":
        return <EffortRecap today={today} />;
      case "meals":
        return mealsBlock;
      default:
        return null;
    }
  };

  return (
    <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center" }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: spacing.xs }}>
        <Pressable
          onPress={() => setCustomizeOpen(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={tr("today.customize")}
        >
          <Settings color={colors.textMuted} size={20} />
        </Pressable>
      </View>
      <TodayHeader />

      {!t ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
          {tr("today.findNorth")}
        </Text>
      ) : null}

      {hero ? (
        <View style={{ width: "100%", alignItems: "center", marginBottom: 16 }}>
        <Pressable
          onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id: "calories" } })}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            alignItems: "center",
          })}
          accessibilityRole="button"
          accessibilityLabel={tr("today.heroA11y", {
            value: hero.value,
            label: hero.label,
            pace: pace?.state ? tr("today.pacePhrase", { phrase: tr(pacePhraseKey(pace.state)) }) : "",
          })}
        >
          <IntakeRing
            label=""
            value={hero.consumed}
            target={hero.effectiveTarget}
            color={colors.star}
            unit="cal"
            size={RING_SIZE}
            hideCenter
            hideLabel
            trackColor={colors.disabled}
            paceMark={pace?.fraction ?? undefined}
            paceState={pace?.state ?? undefined}
            animated
          />
          <Text
            allowFontScaling={false}
            style={{
              color: hero.over ? colors.error : colors.textPrimary,
              fontSize: 96,
              lineHeight: 100,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -2,
              marginTop: 12,
            }}
          >
            {hero.value}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: 2 }}>{hero.label}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 8,
            }}
          >
            <EquationCell value={hero.consumed} unit={tr("today.eqIn")} color={colors.textSecondary} />
            <EquationDot />
            <EquationCell
              value={hero.burned}
              unit={tr("today.eqBurned")}
              color={hero.burned > 0 ? colors.spark : colors.textMuted}
            />
            <EquationDot />
            <EquationCell
              value={Math.abs(today!.remaining_calories)}
              unit={hero.over ? tr("today.eqOver") : tr("today.eqLeft")}
              color={hero.over ? colors.error : colors.textSecondary}
            />
          </View>
        </Pressable>
        </View>
      ) : t ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginBottom: 16 }}>
          {tr("today.calTarget", { kcal: formatKcal(t.daily_calorie_target) })}
        </Text>
      ) : null}

      {today ? (
        <View style={{ width: "100%", marginBottom: 16 }}>
          <NextActionButton today={today} routines={routines} />
        </View>
      ) : null}

      {visibleSections(layout).map((id) => (
        <View key={id}>{renderSection(id)}</View>
      ))}

      <CustomizeTodaySheet
        visible={customizeOpen}
        layout={layout}
        onSave={(next) => {
          setLayout(next);
          void saveTodayLayout(next);
        }}
        onClose={() => setCustomizeOpen(false)}
      />
    </View>
  );
}

function EquationCell({ value, unit, color }: { value: number; unit: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 12, fontVariant: ["tabular-nums"] }}>
      {formatKcal(value)} {unit}
    </Text>
  );
}

function EquationDot() {
  return <Text style={{ color: colors.textMuted, fontSize: 12 }}>·</Text>;
}

function EffortRecap({ today }: { today: TodaySnapshot | null }) {
  const tr = useT();
  const planned = today?.active_session?.planned_rpe;
  const actual = today?.last_completed_session_today?.actual_rpe;
  const burn = today?.burned_calories ?? 0;
  if (!today || (planned == null && actual == null && burn === 0)) {
    return null;
  }
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        gap: 6,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {tr("today.effortTitle")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        {burn > 0 ? (
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontVariant: ["tabular-nums"] }}>
            {tr("today.calBurned", { kcal: formatKcal(burn) })}
          </Text>
        ) : null}
        {planned != null ? (
          <>
            {burn > 0 ? <EquationDot /> : null}
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {tr("today.planned", { n: planned })}
            </Text>
          </>
        ) : null}
        {actual != null ? (
          <>
            {(burn > 0 || planned != null) ? <EquationDot /> : null}
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
              {tr("today.actual", { n: actual })}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
