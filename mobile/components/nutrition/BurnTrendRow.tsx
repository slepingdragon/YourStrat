import { memo } from "react";
import { Text, View } from "react-native";
import { Sparkline } from "@/components/nutrition/Sparkline";
import type { BurnDay } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

type Props = {
  days: BurnDay[];
};

function BurnTrendRowImpl({ days }: Props) {
  const t = useT();
  const values = days.map((d) => d.calories);
  const today = values[values.length - 1] ?? 0;
  const weekTotal = values.reduce((s, v) => s + v, 0);
  const avg = values.length > 0 ? Math.round(weekTotal / values.length) : 0;

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
          {t("nutrition.workoutBurn")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 8, flexWrap: "wrap" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontVariant: ["tabular-nums"] }}>
            {t("nutrition.calTodaySuffix", { kcal: formatKcal(today) })}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] }}>
            {t("nutrition.avgPerDay", { kcal: formatKcal(avg) })}
          </Text>
        </View>
      </View>
      <Sparkline values={values} target={avg} color={colors.spark} width={88} height={28} />
    </View>
  );
}

export const BurnTrendRow = memo(BurnTrendRowImpl);
