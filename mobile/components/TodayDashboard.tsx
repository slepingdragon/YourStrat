import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { IntakeRing } from "@/components/IntakeRing";
import { MealCard } from "@/components/MealCard";
import { CalorieSparkline } from "@/components/today/CalorieSparkline";
import { NextActionButton } from "@/components/today/NextActionButton";
import { TodayHeader } from "@/components/today/TodayHeader";
import { TodayTrioCards } from "@/components/today/TodayTrioCards";
import type { Meal, NutritionDay, Profile, Routine, TodaySnapshot } from "@/lib/api";
import { roundCal } from "@/lib/targets";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 400;
const HERO_SIZE = 200;

type Props = {
  today: TodaySnapshot | null;
  profile: Profile | null;
  routines: Routine[] | null;
  journalDays: NutritionDay[] | null;
};

function formatHeroNumber(n: number) {
  return roundCal(Math.abs(n)).toLocaleString();
}

export function TodayDashboard({ today, profile, routines, journalDays }: Props) {
  const router = useRouter();
  const t = useT();
  const targets = today?.targets ?? profile;
  const empty = !today?.meals?.length;

  const hero = today
    ? {
        value: formatHeroNumber(today.remaining_calories),
        label: today.remaining_calories < 0 ? t("today.caloriesOver") : t("today.caloriesLeft"),
        over: today.remaining_calories < 0,
        consumed: today.consumed_calories,
        burned: today.burned_calories,
        target: today.targets?.daily_calorie_target ?? 0,
      }
    : null;

  const mealsTotalCal = useMemo(() => {
    if (!today?.meals?.length) return 0;
    return today.meals.reduce((s, m) => s + (m.total_calories ?? 0), 0);
  }, [today?.meals]);

  return (
    <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center" }}>
      <TodayHeader />

      {!targets ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
          {t("today.findNorth")}
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
          accessibilityLabel={t("today.heroA11y", { value: hero.value, label: hero.label, pace: "" })}
        >
          <View
            style={{
              width: HERO_SIZE,
              height: HERO_SIZE,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <View style={{ position: "absolute" }}>
              <IntakeRing
                label=""
                value={hero.consumed}
                target={hero.target}
                color={colors.star}
                unit="cal"
                size={HERO_SIZE}
                hideCenter
                hideLabel
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: hero.over ? colors.error : colors.textPrimary,
                  fontSize: 52,
                  fontWeight: "800",
                  fontVariant: ["tabular-nums"],
                  letterSpacing: -1,
                }}
              >
                {hero.value}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{hero.label}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 8,
            }}
          >
            <EquationCell value={hero.consumed} unit={t("today.eqIn")} color={colors.textSecondary} />
            <EquationDot />
            <EquationCell
              value={hero.burned}
              unit={t("today.eqBurned")}
              color={hero.burned > 0 ? colors.spark : colors.textMuted}
            />
            <EquationDot />
            <EquationCell
              value={Math.abs(today!.remaining_calories)}
              unit={hero.over ? t("today.eqOver") : t("today.eqLeft")}
              color={hero.over ? colors.error : colors.textSecondary}
            />
          </View>
        </Pressable>
        </View>
      ) : targets ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginBottom: 16 }}>
          {t("today.calTarget", { kcal: targets.daily_calorie_target.toLocaleString() })}
        </Text>
      ) : null}

      {today ? (
        <View style={{ width: "100%", marginBottom: 16 }}>
          <NextActionButton today={today} routines={routines} />
        </View>
      ) : null}

      <EffortRecap today={today} />

      {today ? (
        <View style={{ marginBottom: 16 }}>
          <TodayTrioCards today={today} profile={profile} />
        </View>
      ) : null}

      {journalDays && journalDays.length >= 2 ? (
        <View style={{ marginBottom: 20 }}>
          <CalorieSparkline days={journalDays} target={targets?.daily_calorie_target ?? 0} />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: 12,
          justifyContent: empty ? "center" : "space-between",
        }}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{t("meal.section")}</Text>
        {!empty ? (
          <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] }}>
            {t("meal.loggedSummary", { n: today!.meals.length, kcal: roundCal(mealsTotalCal).toLocaleString() })}
          </Text>
        ) : null}
      </View>

      {empty ? (
        <Text style={{ color: colors.textMuted, lineHeight: 22, textAlign: "center" }}>
          {t("meal.noneToday")}
        </Text>
      ) : (
        today?.meals.map((m: Meal) => (
          <MealCard key={m.id} meal={m} onPress={() => router.push(`/meal/${m.id}`)} />
        ))
      )}
    </View>
  );
}

function EquationCell({ value, unit, color }: { value: number; unit: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 12, fontVariant: ["tabular-nums"] }}>
      {Math.round(value).toLocaleString()} {unit}
    </Text>
  );
}

function EquationDot() {
  return <Text style={{ color: colors.textMuted, fontSize: 12 }}>·</Text>;
}

function EffortRecap({ today }: { today: TodaySnapshot | null }) {
  const t = useT();
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
        {t("today.effortTitle")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        {burn > 0 ? (
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontVariant: ["tabular-nums"] }}>
            {t("today.calBurned", { kcal: Math.round(burn).toLocaleString() })}
          </Text>
        ) : null}
        {planned != null ? (
          <>
            {burn > 0 ? <EquationDot /> : null}
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {t("today.planned", { n: planned })}
            </Text>
          </>
        ) : null}
        {actual != null ? (
          <>
            {(burn > 0 || planned != null) ? <EquationDot /> : null}
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
              {t("today.actual", { n: actual })}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
