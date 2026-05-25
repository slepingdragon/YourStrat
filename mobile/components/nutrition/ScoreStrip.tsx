import { memo } from "react";
import { Text, View } from "react-native";
import type { SummaryStats } from "@/lib/nutritionSummaryStats";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
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
  const t = useT();
  const streakValue = stats.streakDays > 0 ? t("nutrition.scoreDays", { n: stats.streakDays }) : "—";
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
        label={t("nutrition.scoreStreak")}
        value={streakValue}
        hint={stats.streakDays > 0 ? t("nutrition.scoreStreakHit") : t("nutrition.scoreStreakEmpty")}
        accent={stats.streakDays > 0 ? colors.spark : undefined}
      />
      <Chip label={t("metric.protein")} value={proteinHit} hint={t("nutrition.scoreProteinHint")} />
      <Chip label={t("nutrition.scoreOnTarget")} value={onTarget} hint={t("nutrition.scoreOnTargetHint")} />
      <Chip label={t("nutrition.scoreAvgCal")} value={avgCal} hint={t("nutrition.scoreAvgCalHint")} />
    </View>
  );
}

export const ScoreStrip = memo(ScoreStripImpl);
