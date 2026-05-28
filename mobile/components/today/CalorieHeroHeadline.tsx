import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { calorieOverSeverity } from "@/lib/calorieHeroVisuals";

const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  value: string;
  label: string;
  consumed: number;
  target: number;
  over: boolean;
  fontSize?: number;
};

export function CalorieHeroHeadline({
  value,
  label,
  consumed,
  target,
  over,
  fontSize = 52,
}: Props) {
  const severity = useSharedValue(over ? calorieOverSeverity(consumed, target) : 0);

  useEffect(() => {
    const next = over ? calorieOverSeverity(consumed, target) : 0;
    severity.value = withTiming(next, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [consumed, target, over, severity]);

  const valueStyle = useAnimatedStyle(() => ({
    color: interpolateColor(severity.value, [0, 1], [colors.textPrimary, colors.error]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(severity.value, [0, 1], [colors.textSecondary, colors.error]),
    opacity: 0.55 + severity.value * 0.45,
  }));

  return (
    <>
      <AnimatedText
        style={[
          {
            fontSize,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
            textAlign: "center",
          },
          valueStyle,
        ]}
      >
        {value}
      </AnimatedText>
      <AnimatedText
        style={[
          {
            fontSize: 14,
            marginTop: spacing.xs / 2,
            textAlign: "center",
          },
          labelStyle,
        ]}
      >
        {label}
      </AnimatedText>
    </>
  );
}
