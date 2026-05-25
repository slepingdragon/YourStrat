import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { IntakeRing } from "@/components/IntakeRing";
import { SourceLinkRow } from "@/components/SourceLinkRow";
import { Card, Screen, BackHeader, toastError } from "@/components/ui";
import { getNutritionJournal, type Meal, type NutritionDayTotals } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { isNutritionMetricId, METRIC_INFO } from "@/lib/nutritionMetricCopy";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import {
  formatMetricAmount,
  getMetricTarget,
  getMetricValueFromMeal,
  getMetricValueFromTotals,
  metricBalance,
  TODAY_METRIC_SPECS,
} from "@/lib/todayMetrics";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const EMPTY_TOTALS: NutritionDayTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
};

const HERO_RING = 120;

function mealTitle(meal: Meal, fallback: string) {
  return meal.items?.slice(0, 2).map((i) => i.name).join(", ") || fallback;
}

export default function NutritionMetricDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const profile = useStore((s) => s.profile);
  const targets = targetsFromProfile(profile);
  const metricId = id && isNutritionMetricId(id) ? id : null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const [totals, setTotals] = useState<NutritionDayTotals>({ ...EMPTY_TOTALS });
  const [meals, setMeals] = useState<Meal[]>([]);
  const loadErrorShown = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await getNutritionJournal();
      const today = data.days.find((d) => d.date === todayKey);
      setTotals(today?.totals ?? { ...EMPTY_TOTALS });
      setMeals(today?.meals ?? []);
    } catch (e) {
      console.error(e);
      if (!loadErrorShown.current) {
        loadErrorShown.current = true;
        toastError((e as Error).message);
      }
    }
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const mealRows = useMemo(() => {
    if (!metricId) return [];
    return meals
      .map((meal) => ({
        id: meal.id,
        title: mealTitle(meal, t("nutrition.mealFallback")),
        amount: getMetricValueFromMeal(meal, metricId),
      }))
      .filter((row) => row.amount > 0);
  }, [meals, metricId, t]);

  if (!metricId || !targets) {
    return (
      <Screen>
        <BackHeader title={t("nutritionMetric.headerTitle")} />
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          {!metricId ? t("nutritionMetric.unknown") : t("nutritionMetric.completeOnboarding")}
        </Text>
      </Screen>
    );
  }

  const info = METRIC_INFO[metricId];
  const metricTitle = t(`nutritionMetric.${metricId}.title`);
  const metricAbout = t(`nutritionMetric.${metricId}.about`);
  const metricTip = t(`nutritionMetric.${metricId}.tip`);
  const spec = TODAY_METRIC_SPECS[metricId];
  const consumed = getMetricValueFromTotals(totals, metricId);
  const target = getMetricTarget(targets, metricId);
  const balance = metricBalance(consumed, target, spec.unit);

  return (
    <Screen padding={false}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <BackHeader title={metricTitle} />

        <View style={{ alignItems: "center", marginTop: 8 }}>
          <IntakeRing
            label={metricTitle}
            value={consumed}
            target={target}
            color={spec.color}
            unit={spec.unit}
            size={HERO_RING}
          />
        </View>

        <Text
          style={{
            color: balance.color,
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 16,
            fontVariant: ["tabular-nums"],
          }}
        >
          {balance.text}
        </Text>

        <Card style={{ marginTop: 24 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.sm }}>{t("nutritionMetric.yourNumbers")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: colors.textSecondary }}>{t("nutritionMetric.todaysTotal")}</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
              {formatMetricAmount(consumed, spec.unit)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.textSecondary }}>{t("nutritionMetric.yourTarget")}</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
              {formatMetricAmount(target, spec.unit)}
            </Text>
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.sm }}>{t("nutritionMetric.whatThisIs")}</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{metricAbout}</Text>
          <Text style={{ color: colors.textMuted, lineHeight: 20, marginTop: spacing.md, fontSize: 13 }}>{metricTip}</Text>
        </Card>

        {info.learnMore.length > 0 ? (
          <Card style={{ marginTop: 16, paddingBottom: 8 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: "600", marginBottom: 4 }}>
              {t("nutritionMetric.learnMore")}
            </Text>
            {info.learnMore.map((source, index) => (
              <View key={source.url}>
                {index > 0 ? (
                  <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 40 }} />
                ) : null}
                <SourceLinkRow source={source} />
              </View>
            ))}
          </Card>
        ) : null}

        <Text style={{ color: colors.textPrimary, fontWeight: "600", marginTop: 28, marginBottom: 12 }}>
          {t("nutritionMetric.mealsToday")}
        </Text>
        {mealRows.length === 0 ? (
          <Text style={{ color: colors.textMuted, lineHeight: 22 }}>
            {t("nutritionMetric.logFromCamera")}
          </Text>
        ) : (
          mealRows.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => router.push({ pathname: "/meal/[id]", params: { id: row.id } })}
              accessibilityRole="button"
              accessibilityLabel={t("nutritionMetric.openMeal", { name: row.title })}
            >
              <Card style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: "600", flex: 1 }} numberOfLines={2}>
                  {row.title}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "600",
                  }}
                >
                  {formatMetricAmount(row.amount, spec.unit)}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
