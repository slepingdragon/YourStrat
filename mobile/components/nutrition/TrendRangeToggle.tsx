import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const TREND_RANGE_OPTIONS = [7, 14, 30] as const;
export type TrendRangeDays = (typeof TREND_RANGE_OPTIONS)[number];

type Props = {
  value: TrendRangeDays;
  onChange: (days: TrendRangeDays) => void;
};

/** Robinhood-style inline range: tap 7D · 14D · 30D — no sheet. */
export function TrendRangeToggle({ value, onChange }: Props) {
  const t = useT();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: spacing.xl,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      {TREND_RANGE_OPTIONS.map((n) => {
        const active = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => {
              if (n === value) return;
              Haptics.selectionAsync();
              onChange(n);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t("nutrition.trendRangeDays", { n })}
            hitSlop={10}
            style={({ pressed }) => ({ alignItems: "center", opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              style={{
                color: active ? colors.textPrimary : colors.textMuted,
                fontSize: 15,
                fontWeight: active ? "700" : "500",
                fontVariant: ["tabular-nums"],
              }}
            >
              {n}D
            </Text>
            <View
              style={{
                marginTop: spacing.xs + 2,
                height: 2,
                width: 28,
                borderRadius: 1,
                backgroundColor: active ? colors.star : "transparent",
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
