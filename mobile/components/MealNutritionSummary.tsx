import { Text, View } from "react-native";
import { Card } from "@/components/ui";
import type { MealTotals } from "@/lib/mealNutrition";
import { formatKcal } from "@/lib/format";
import { formatGram, formatSodium } from "@/lib/mealNutrition";
import { colors } from "@/theme/colors";

type MacroProps = { label: string; value: string; color: string };

function MacroChip({ label, value, color }: MacroProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", minWidth: 72 }}>
      <Text style={{ color, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700", marginTop: 4, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  const muted = value === "—";
  return (
    <View style={{ flex: 1, alignItems: "center", minWidth: 88 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text
        style={{
          color: muted ? colors.textMuted : colors.textPrimary,
          fontSize: 15,
          fontWeight: "600",
          marginTop: 4,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

type Props = {
  totals: MealTotals;
  title?: string;
};

export function MealNutritionSummary({ totals, title }: Props) {
  return (
    <Card style={{ marginBottom: 20 }}>
      {title ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{title}</Text>
      ) : null}
      <Text
        style={{
          color: colors.star,
          fontSize: 48,
          fontWeight: "800",
          textAlign: "center",
          fontVariant: ["tabular-nums"],
        }}
      >
        {formatKcal(totals.calories)}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginTop: 2 }}>calories</Text>
      <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between" }}>
        <MacroChip label="Protein" value={formatGram(totals.protein_g)} color={colors.protein} />
        <MacroChip label="Carbs" value={formatGram(totals.carbs_g)} color={colors.carbs} />
        <MacroChip label="Fat" value={formatGram(totals.fat_g)} color={colors.fat} />
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 18,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          justifyContent: "space-between",
        }}
      >
        <MicroStat label="Fiber" value={formatGram(totals.fiber_g, true)} />
        <MicroStat label="Sugar" value={formatGram(totals.sugar_g, true)} />
        <MicroStat label="Sodium" value={formatSodium(totals.sodium_mg, true)} />
      </View>
    </Card>
  );
}
