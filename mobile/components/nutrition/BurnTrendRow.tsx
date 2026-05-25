import { memo } from "react";
import { Text, View } from "react-native";
import { Sparkline } from "@/components/nutrition/Sparkline";
import type { BurnDay } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { colors } from "@/theme/colors";

type Props = {
  days: BurnDay[];
};

function BurnTrendRowImpl({ days }: Props) {
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
          Workout burn
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 8, flexWrap: "wrap" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontVariant: ["tabular-nums"] }}>
            {formatKcal(today)} cal today
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] }}>
            avg {formatKcal(avg)}/day
          </Text>
        </View>
      </View>
      <Sparkline values={values} target={avg} color={colors.spark} width={88} height={28} />
    </View>
  );
}

export const BurnTrendRow = memo(BurnTrendRowImpl);
