import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MealCard } from "@/components/MealCard";
import { Button } from "@/components/ui";
import type { Meal, Profile, TodaySnapshot } from "@/lib/api";
import type { NutritionTargets } from "@/lib/nutritionTargets";
import { roundCal } from "@/lib/targets";
import { buildTodayHighlight } from "@/lib/todayInsights";
import {
  getMetricTarget,
  getMetricValue,
  metricGridCard,
  TODAY_GRID_METRICS,
  TODAY_METRIC_SPECS,
  type TodayMetricId,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 400;
const GRID_GAP = 10;

type Props = {
  today: TodaySnapshot | null;
  profile: Profile | null;
  nutritionTargets: NutritionTargets | null;
};

function formatHeroNumber(n: number) {
  return roundCal(Math.abs(n)).toLocaleString();
}

function MetricGridCard({
  id,
  today,
  targets,
}: {
  id: TodayMetricId;
  today: TodaySnapshot;
  targets: NutritionTargets;
}) {
  const router = useRouter();
  const spec = TODAY_METRIC_SPECS[id];
  const consumed = getMetricValue(today, id);
  const target = getMetricTarget(targets, id);
  const { headline, subline, over, progress } = metricGridCard(id, consumed, target);
  const barColor = over ? colors.error : spec.color;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id } })}
      style={({ pressed }) => ({
        width: "48%",
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${spec.label}, ${headline}, ${subline}`}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>
        {spec.label}
      </Text>
      <Text
        style={{
          color: over ? colors.error : colors.textPrimary,
          fontSize: 18,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
        numberOfLines={1}
      >
        {headline}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          marginTop: 4,
          fontVariant: ["tabular-nums"],
        }}
        numberOfLines={1}
      >
        {subline}
      </Text>
      <View
        style={{
          height: 3,
          backgroundColor: colors.border,
          borderRadius: 2,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <View style={{ height: 3, width: `${progress * 100}%`, backgroundColor: barColor, borderRadius: 2 }} />
      </View>
    </Pressable>
  );
}

export function TodayDashboard({ today, profile, nutritionTargets }: Props) {
  const router = useRouter();
  const t = today?.targets ?? profile;
  const empty = !today?.meals?.length;

  const highlight = useMemo(
    () => (today ? buildTodayHighlight(today, profile) : null),
    [today, profile]
  );

  const hero = today
    ? {
        value: formatHeroNumber(today.remaining_calories),
        label: today.remaining_calories < 0 ? "calories over today" : "calories left today",
        over: today.remaining_calories < 0,
        burned: today.burned_calories,
      }
    : null;

  return (
    <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center" }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        Today
      </Text>

      {!t ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
          Find your North — finish onboarding to see your daily targets.
        </Text>
      ) : null}

      {hero ? (
        <Pressable
          onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id: "calories" } })}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 8 })}
          accessibilityRole="button"
          accessibilityLabel={`${hero.value} ${hero.label}. Open nutrition details.`}
        >
          <Text
            style={{
              color: hero.over ? colors.error : colors.textPrimary,
              fontSize: 56,
              fontWeight: "800",
              textAlign: "center",
              fontVariant: ["tabular-nums"],
              letterSpacing: -1,
            }}
          >
            {hero.value}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: "center", marginTop: 6 }}>
            {hero.label}
          </Text>
          {hero.burned > 0 ? (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 14,
                textAlign: "center",
                marginTop: 8,
                fontVariant: ["tabular-nums"],
              }}
            >
              {hero.burned.toLocaleString()} burned today
            </Text>
          ) : null}
        </Pressable>
      ) : t ? (
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginBottom: 16 }}>
          {t.daily_calorie_target.toLocaleString()} cal target
        </Text>
      ) : null}

      {today && nutritionTargets ? (
        <>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontWeight: "600",
              textAlign: "center",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            Right now
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              rowGap: GRID_GAP,
              marginBottom: highlight ? 12 : 20,
            }}
          >
            {TODAY_GRID_METRICS.map((id) => (
              <MetricGridCard key={id} id={id} today={today} targets={nutritionTargets} />
            ))}
          </View>

          {highlight ? (
            <Text
              style={{
                color: colors.warning,
                fontSize: 13,
                lineHeight: 20,
                textAlign: "center",
                marginBottom: 20,
                paddingHorizontal: 8,
                fontVariant: ["tabular-nums"],
              }}
            >
              {highlight}
            </Text>
          ) : null}
        </>
      ) : null}

      <Text style={{ color: colors.textPrimary, fontWeight: "600", marginBottom: 12, textAlign: "center" }}>Meals</Text>

      {empty ? (
        <View style={{ alignItems: "center", gap: 14 }}>
          <Text style={{ color: colors.textMuted, lineHeight: 22, textAlign: "center" }}>
            Nothing logged yet. Scan your first meal when you&apos;re ready.
          </Text>
          <View style={{ width: "100%", maxWidth: 240 }}>
            <Button label="Log food" onPress={() => router.push("/scan")} compact />
          </View>
        </View>
      ) : (
        today?.meals.map((m: Meal) => (
          <MealCard key={m.id} meal={m} onPress={() => router.push(`/meal/${m.id}`)} />
        ))
      )}
    </View>
  );
}
