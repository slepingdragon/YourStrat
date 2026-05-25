import { Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  /** The big weight value, already formatted in display units (e.g. "135"), or
   * "—" when there is nothing to show (first set / no-weight exercise). */
  weight: string;
  /** Unit suffix for the weight ("kg" / "lb"). Hidden when `weight` is "—". */
  unit: string;
  /** The line under the hero (e.g. "× 8 reps" or "Set 1 of 3"). */
  subline: string;
  /** Spoken label so VoiceOver reads the instrument as one phrase. */
  accessibilityLabel: string;
};

/**
 * The active-set instrument (UX-DR18, W-M1). A 96pt tabular weight readable from
 * ~6 ft at the bench, with the unit and reps beneath it. `allowFontScaling` is
 * off on the numeral so OS text-size settings can't reflow the hero.
 */
export function WeightHero({ weight, unit, subline, accessibilityLabel }: Props) {
  const hasWeight = weight !== "—";
  return (
    <View
      style={{ alignItems: "center", paddingTop: spacing.lg, paddingBottom: spacing.md }}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 96,
            lineHeight: 104,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            letterSpacing: -2,
          }}
        >
          {weight}
        </Text>
        {hasWeight ? (
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 22,
              fontWeight: "600",
              marginLeft: spacing.sm,
              marginBottom: spacing.lg,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: "600", marginTop: spacing.xs }}>
        {subline}
      </Text>
    </View>
  );
}
