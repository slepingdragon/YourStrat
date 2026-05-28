import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TrendChart, type TrendPoint } from "@/components/nutrition/TrendChart";
import type { NutritionDay } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { roundCal } from "@/lib/targets";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  days: NutritionDay[];
  target: number;
};

export function CalorieSparkline({ days, target }: Props) {
  const t = useT();
  const router = useRouter();

  const points: TrendPoint[] = useMemo(() => {
    return [...days]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((d) => ({ date: d.date, value: d.totals?.calories ?? 0 }));
  }, [days]);

  const validValues = useMemo(() => points.map((p) => p.value).filter((v) => v > 0), [points]);
  const avg = validValues.length
    ? validValues.reduce((s, n) => s + n, 0) / validValues.length
    : 0;

  if (validValues.length < 2) return null;

  return (
    <Pressable
      onPress={() => router.push("/nutrition")}
      style={({ pressed }) => ({
        width: "100%",
        marginTop: spacing.xs,
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={t("sparkline.a11y", { kcal: roundCal(avg) })}
    >
      <View style={{ alignItems: "center", marginBottom: spacing.xs, gap: 2 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", textAlign: "center" }}>
          {t("sparkline.last7")}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontVariant: ["tabular-nums"],
            textAlign: "center",
          }}
        >
          {t("sparkline.avg", { kcal: roundCal(avg).toLocaleString() })}
        </Text>
      </View>
      <TrendChart
        data={points}
        target={target}
        avg={avg}
        compact
        height={120}
        lineColor={colors.star}
      />
    </Pressable>
  );
}
