import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

type Tone = "limit" | "goal";

type Props = {
  label: string;
  value: number;
  target: number;
  unit: "g" | "mg";
  color: string;
  /** "limit" = should stay under target (sugar, sodium). "goal" = should reach target (fiber). */
  tone: Tone;
  onPress?: () => void;
};

function MicroPinBarImpl({ label, value, target, unit, color, tone, onPress }: Props) {
  const t = useT();
  const targetSafe = target > 0 ? target : 1;
  const baseRatio = Math.min(1, Math.max(0, value / targetSafe));
  const overRatio = Math.max(0, Math.min(1, (value - targetSafe) / targetSafe));

  const baseWidth = useSharedValue(0);
  const overWidth = useSharedValue(0);

  useEffect(() => {
    baseWidth.value = withTiming(baseRatio, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    overWidth.value = withTiming(overRatio, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [baseRatio, overRatio, baseWidth, overWidth]);

  const baseStyle = useAnimatedStyle(() => ({
    width: `${baseWidth.value * 100}%`,
  }));

  const overStyle = useAnimatedStyle(() => ({
    width: `${overWidth.value * 100}%`,
  }));

  const over = value > target;
  const statusLabel = (() => {
    if (target <= 0) return "";
    if (tone === "limit") {
      if (over) return t("nutrition.microOverLimit");
      if (value >= target * 0.85) return t("nutrition.microNearLimit");
      return t("nutrition.microInRange");
    }
    if (value >= target) return t("nutrition.microGoalHit");
    if (value >= target * 0.7) return t("nutrition.microClose");
    return t("nutrition.microLow");
  })();

  const statusColor = (() => {
    if (target <= 0) return colors.textMuted;
    if (tone === "limit") {
      if (over) return colors.error;
      if (value >= target * 0.85) return colors.warning;
      return colors.success;
    }
    if (value >= target) return colors.success;
    if (value >= target * 0.7) return colors.warning;
    return colors.textMuted;
  })();

  const baseFillColor = tone === "limit" && !over ? color : tone === "goal" ? color : colors.warning;
  const valueText =
    unit === "mg"
      ? t("nutrition.macroValueMg", { value: Math.round(value), target: Math.round(target) })
      : t("nutrition.macroValueG", { value: Math.round(value), target: Math.round(target) });

  const body = (
    <View style={{ paddingVertical: 10, paddingHorizontal: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>{label}</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontVariant: ["tabular-nums"] }}>
          {valueText}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: colors.surfaceElevated,
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        <Animated.View
          style={[
            { height: "100%", backgroundColor: baseFillColor, borderRadius: 999 },
            baseStyle,
          ]}
        />
        <Animated.View
          style={[
            { height: "100%", backgroundColor: colors.error, borderRadius: 999 },
            overStyle,
          ]}
        />
      </View>
      {statusLabel ? (
        <Text style={{ color: statusColor, fontSize: 11, marginTop: 4, fontWeight: "600" }}>
          {statusLabel}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("nutrition.microA11y", { label, value: valueText, status: statusLabel })}
    >
      {({ pressed }) => <View style={{ opacity: pressed ? 0.7 : 1 }}>{body}</View>}
    </Pressable>
  );
}

export const MicroPinBar = memo(MicroPinBarImpl);
