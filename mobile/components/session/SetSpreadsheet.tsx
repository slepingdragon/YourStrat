import { memo } from "react";
import { Text, View } from "react-native";
import { Check } from "@/components/icons";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

/** One logged set; `weight` is the value in DISPLAY units (already converted),
 * null for a body-weight / cardio set. */
export type LoggedSet = { weight: number | null; reps: number | null };

export type SpreadsheetRow = {
  name: string;
  /** Planned set count for this exercise. */
  sets: number;
};

type Props = {
  rows: SpreadsheetRow[];
  /** Per-exercise logged sets, indexed by exercise then set. */
  log: LoggedSet[][];
  activeExercise: number;
  activeSet: number;
  unit: string;
};

/**
 * Strong-style session table (UX-DR19, W-A1): exercises as rows, sets as
 * columns. The active cell carries a 2pt left border; logged cells show the
 * lifted weight; pending cells a faint dot. A bounded grid (a routine's
 * exercises), so a plain map — not a virtualized feed (CLAUDE §3).
 */
export const SetSpreadsheet = memo(function SetSpreadsheet({ rows, log, activeExercise, activeSet, unit }: Props) {
  if (rows.length === 0) return null;
  const maxSets = Math.max(1, ...rows.map((r) => r.sets));
  const columns = Array.from({ length: maxSets }, (_, i) => i);

  return (
    <View
      style={{
        marginTop: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      {/* Header: set numbers */}
      <View style={{ flexDirection: "row", paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
        <View style={{ width: 92 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>
            {unit.toUpperCase()}
          </Text>
        </View>
        {columns.map((c) => (
          <View key={c} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
              {c + 1}
            </Text>
          </View>
        ))}
      </View>

      {rows.map((row, ex) => {
        const isActiveRow = ex === activeExercise;
        const rowLog = log[ex] ?? [];
        return (
          <View
            key={ex}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: isActiveRow ? colors.surfaceElevated : "transparent",
            }}
          >
            <View style={{ width: 92, paddingRight: spacing.sm }}>
              <Text
                numberOfLines={1}
                style={{
                  color: isActiveRow ? colors.textPrimary : colors.textSecondary,
                  fontSize: 13,
                  fontWeight: isActiveRow ? "700" : "500",
                }}
              >
                {row.name}
              </Text>
            </View>
            {columns.map((c) => {
              const within = c < row.sets;
              const logged = rowLog[c];
              const isActiveCell = isActiveRow && c === activeSet;
              return (
                <View
                  key={c}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 28,
                    borderLeftWidth: isActiveCell ? 2 : 0,
                    borderLeftColor: colors.spark,
                    backgroundColor: isActiveCell ? colors.surface : "transparent",
                  }}
                >
                  {!within ? null : logged ? (
                    logged.weight != null ? (
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 13,
                          fontWeight: "600",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {logged.weight}
                      </Text>
                    ) : (
                      <Check color={colors.textSecondary} size={14} />
                    )
                  ) : (
                    <Text style={{ color: isActiveCell ? colors.spark : colors.textMuted, fontSize: 13 }}>
                      ·
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
});
