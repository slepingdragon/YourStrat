import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  value: number | null;
  onChange: (rpe: number) => void;
  size?: "default" | "compact";
};

const RPE_LABELS: Record<number, string> = {
  1: "Easy",
  3: "Light",
  5: "Moderate",
  7: "Hard",
  9: "Near max",
  10: "All out",
};

export function rpeLabel(rpe: number | null | undefined): string | null {
  if (rpe == null) return null;
  if (RPE_LABELS[rpe]) return RPE_LABELS[rpe];
  if (rpe <= 2) return "Easy";
  if (rpe <= 4) return "Light";
  if (rpe <= 6) return "Moderate";
  if (rpe <= 8) return "Hard";
  return "All out";
}

export function RpePicker({ value, onChange, size = "default" }: Props) {
  const buttons = size === "compact" ? 36 : 44;
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityLabel={`Effort ${n} of 10`}
              accessibilityState={{ selected }}
              style={({ pressed }) => ({
                width: buttons,
                height: buttons,
                borderRadius: buttons / 2,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: selected ? colors.star : colors.border,
                backgroundColor: selected ? colors.star : pressed ? colors.surface : "transparent",
              })}
            >
              <Text
                style={{
                  color: selected ? colors.bg : colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>1 · Easy</Text>
        {value != null ? (
          <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: "600" }}>
            {value} · {rpeLabel(value)}
          </Text>
        ) : null}
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>10 · All out</Text>
      </View>
    </View>
  );
}
