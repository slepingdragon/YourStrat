import { Pressable, Text, View } from "react-native";
import { useT, translate } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  value: number | null;
  onChange: (rpe: number) => void;
  size?: "default" | "compact";
};

const RPE_LABEL_KEYS: Record<number, string> = {
  1: "rpe.easy",
  3: "rpe.light",
  5: "rpe.moderate",
  7: "rpe.hard",
  9: "rpe.nearMax",
  10: "rpe.allOut",
};

export function rpeLabel(rpe: number | null | undefined): string | null {
  if (rpe == null) return null;
  if (RPE_LABEL_KEYS[rpe]) return translate(RPE_LABEL_KEYS[rpe]);
  if (rpe <= 2) return translate("rpe.easy");
  if (rpe <= 4) return translate("rpe.light");
  if (rpe <= 6) return translate("rpe.moderate");
  if (rpe <= 8) return translate("rpe.hard");
  return translate("rpe.allOut");
}

export function RpePicker({ value, onChange, size = "default" }: Props) {
  const t = useT();
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
              accessibilityLabel={t("rpe.effortA11y", { n })}
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
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("rpe.lowAnchor")}</Text>
        {value != null ? (
          <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: "600" }}>
            {t("rpe.valueLabel", { n: value, label: rpeLabel(value) ?? "" })}
          </Text>
        ) : null}
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("rpe.highAnchor")}</Text>
      </View>
    </View>
  );
}
