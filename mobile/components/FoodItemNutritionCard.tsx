import { Text, View } from "react-native";
import { Card, Input } from "@/components/ui";
import type { MealItem } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { formatGram, formatSodium } from "@/lib/mealNutrition";
import { colors } from "@/theme/colors";

type Props = {
  item: MealItem;
  index?: number;
  editable?: boolean;
  onChange?: (field: keyof MealItem, value: string) => void;
};

/** 1pt confidence whisker (Story 3.4): taller = more uncertain; hidden at 0. */
function Whisker({ band }: { band: number }) {
  const h = Math.min(14, Math.max(3, band * 36));
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={{ marginLeft: 5, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ width: 5, height: 1, backgroundColor: colors.textMuted }} />
      <View style={{ width: 1, height: h, backgroundColor: colors.textMuted }} />
      <View style={{ width: 5, height: 1, backgroundColor: colors.textMuted }} />
    </View>
  );
}

function StatLine({
  label,
  value,
  color,
  range,
}: {
  label: string;
  value: string;
  color?: string;
  range?: number | null;
}) {
  const muted = value === "—";
  const showWhisker = !muted && range != null && range > 0;
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
        <Text
          style={{
            color: muted ? colors.textMuted : color ?? colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
            fontVariant: ["tabular-nums"],
          }}
        >
          {value}
        </Text>
        {showWhisker ? <Whisker band={range} /> : null}
      </View>
    </View>
  );
}

function NumField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={{ flex: 1, minWidth: 72 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{label}</Text>
      <Input value={value} onChangeText={onChangeText} keyboardType="decimal-pad" placeholder="0" />
    </View>
  );
}

export function FoodItemNutritionCard({ item, index, editable, onChange }: Props) {
  const cal = formatKcal(item.calories || 0);

  // Confidence whiskers (Story 3.4): per-macro range + a spoken summary.
  const cr = item.confidence_range;
  const macroLabel = `Protein ${formatGram(item.protein_g)}, carbs ${formatGram(item.carbs_g)}, fat ${formatGram(item.fat_g)}`;
  const rangeText = (v: number) => `${Math.round(v * (1 - (cr ?? 0)))} to ${Math.round(v * (1 + (cr ?? 0)))} grams`;
  const macroHint =
    cr != null && cr > 0
      ? `Estimated ranges: protein ${rangeText(item.protein_g)}, carbs ${rangeText(item.carbs_g)}, fat ${rangeText(item.fat_g)}.`
      : undefined;

  return (
    <Card style={{ marginBottom: 14 }}>
      {editable && onChange ? (
        <>
          <Input value={item.name} onChangeText={(v) => onChange("name", v)} placeholder="Food name" centered={false} />
          <View style={{ height: 8 }} />
          <Input value={item.portion ?? ""} onChangeText={(v) => onChange("portion", v)} placeholder="Portion" centered={false} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>{item.name}</Text>
          {item.portion ? (
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{item.portion}</Text>
          ) : null}
        </>
      )}

      <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 14, gap: 12 }}>
        {editable && onChange ? (
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>Calories</Text>
            <Input
              value={String(item.calories)}
              onChangeText={(v) => onChange("calories", v)}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>
        ) : (
          <View>
            <Text style={{ color: colors.star, fontSize: 32, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{cal}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>cal</Text>
          </View>
        )}
        <View
          accessible
          accessibilityLabel={macroLabel}
          accessibilityHint={macroHint}
          style={{ flex: 2, flexDirection: "row", justifyContent: "space-between" }}
        >
          <StatLine label="Protein" value={formatGram(item.protein_g)} color={colors.protein} range={cr} />
          <StatLine label="Carbs" value={formatGram(item.carbs_g)} color={colors.carbs} range={cr} />
          <StatLine label="Fat" value={formatGram(item.fat_g)} color={colors.fat} range={cr} />
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 14, gap: 8 }}>
        <StatLine label="Fiber" value={formatGram(item.fiber_g, true)} />
        <StatLine label="Sugar" value={formatGram(item.sugar_g, true)} />
        <StatLine label="Sodium" value={formatSodium(item.sodium_mg, true)} />
      </View>

      {editable && onChange ? (
        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Adjust macros</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <NumField label="Protein (g)" value={String(item.protein_g)} onChangeText={(v) => onChange("protein_g", v)} />
            <NumField label="Carbs (g)" value={String(item.carbs_g)} onChangeText={(v) => onChange("carbs_g", v)} />
            <NumField label="Fat (g)" value={String(item.fat_g)} onChangeText={(v) => onChange("fat_g", v)} />
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <NumField label="Fiber (g)" value={String(item.fiber_g ?? 0)} onChangeText={(v) => onChange("fiber_g", v)} />
            <NumField label="Sugar (g)" value={String(item.sugar_g ?? 0)} onChangeText={(v) => onChange("sugar_g", v)} />
            <NumField label="Sodium (mg)" value={String(item.sodium_mg ?? 0)} onChangeText={(v) => onChange("sodium_mg", v)} />
          </View>
        </View>
      ) : null}

      {index != null && item.confidence != null && item.confidence < 0.7 ? (
        <Text style={{ color: colors.warning, fontSize: 11, marginTop: 10 }}>Low confidence — double-check portions</Text>
      ) : null}
    </Card>
  );
}
