import { memo } from "react";
import { Text, View } from "react-native";
import type { SummaryStats } from "@/lib/nutritionSummaryStats";
import { formatKcal } from "@/lib/format";
import { colors } from "@/theme/colors";

type Props = {
  stats: SummaryStats;
};

function Chip({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={{
          color: accent ?? colors.textPrimary,
          fontSize: 18,
          fontWeight: "700",
          marginTop: 4,
          fontVariant: ["tabular-nums"],
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      {hint ? (
        <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function ScoreStripImpl({ stats }: Props) {
  const streakValue = stats.streakDays > 0 ? `${stats.streakDays}d` : "—";
  const proteinHit =
    stats.proteinHitRate.total > 0
      ? `${stats.proteinHitRate.hit}/${stats.proteinHitRate.total}`
      : "—";
  const onTarget =
    stats.onTargetDays.total > 0
      ? `${stats.onTargetDays.hit}/${stats.onTargetDays.total}`
      : "—";
  const avgCal = stats.avgCalories7d != null ? formatKcal(stats.avgCalories7d) : "—";

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Chip
        label="Streak"
        value={streakValue}
        hint={stats.streakDays > 0 ? "days in a row" : "log to start"}
        accent={stats.streakDays > 0 ? colors.spark : undefined}
      />
      <Chip label="Protein" value={proteinHit} hint="hit goal" />
      <Chip label="On target" value={onTarget} hint="±10% cal" />
      <Chip label="Avg cal" value={avgCal} hint="last 7d" />
    </View>
  );
}

export const ScoreStrip = memo(ScoreStripImpl);
