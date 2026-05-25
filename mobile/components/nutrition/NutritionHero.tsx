import { memo } from "react";
import { Text, View } from "react-native";
import { Sparkline } from "@/components/nutrition/Sparkline";
import { formatKcal, formatMacroGrams } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

type Props = {
  todayKcal: number;
  target: number;
  /** 7-day calorie values (oldest→newest) for the backdrop sparkline. */
  sparklineValues: number[];
  protein: number;
  carbs: number;
  fat: number;
  /** Today minus the 7-day average (Story 6.2); null hides the pill. */
  vsAvgKcal: number | null;
};

function MacroColumn({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text
        allowFontScaling={false}
        style={{ color, fontSize: 32, fontWeight: "700", fontVariant: ["tabular-nums"], letterSpacing: -0.5 }}
      >
        {formatMacroGrams(value)}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/**
 * Nutrition hero (6.4): today's kcal at 72pt sitting over the 7-day calorie
 * sparkline (N-C1), a signed vs-7-day-avg pill (N-A1), and 32pt P/C/F columns
 * (N-M1). Empty today → tabular "0" + calm "of {target} — eat something." (6.1
 * N-E2, no apology copy).
 */
function NutritionHeroImpl({ todayKcal, target, sparklineValues, protein, carbs, fat, vsAvgKcal }: Props) {
  const t = useT();
  const empty = todayKcal <= 0;
  const numberColor = target > 0 && todayKcal > target ? colors.error : colors.textPrimary;

  return (
    <View style={{ width: "100%", alignItems: "center", marginBottom: spacing.xl }}>
      <View style={{ width: "100%", height: 96, alignItems: "center", justifyContent: "center" }}>
        {sparklineValues.length >= 2 ? (
          <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center", opacity: 0.4 }}>
            <Sparkline values={sparklineValues} target={target} color={colors.starDim} width={320} height={96} />
          </View>
        ) : null}
        <Text
          allowFontScaling={false}
          style={{
            color: numberColor,
            fontSize: 72,
            lineHeight: 78,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -2,
          }}
        >
          {formatKcal(todayKcal)}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {empty ? t("nutrition.ofTargetEat", { target: formatKcal(target) }) : t("nutrition.caloriesToday")}
        </Text>
        {!empty && vsAvgKcal != null ? (
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.sm,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
              {t("nutrition.vsAvg", { sign: vsAvgKcal > 0 ? "+" : "", n: vsAvgKcal.toLocaleString() })}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginTop: spacing.lg }}>
        <MacroColumn value={protein} label={t("nutrition.proteinLower")} color={colors.protein} />
        <MacroColumn value={carbs} label={t("nutrition.carbsLower")} color={colors.carbs} />
        <MacroColumn value={fat} label={t("nutrition.fatLower")} color={colors.fat} />
      </View>
    </View>
  );
}

export const NutritionHero = memo(NutritionHeroImpl);
