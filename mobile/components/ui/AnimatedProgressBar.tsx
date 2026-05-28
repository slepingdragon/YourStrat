import { useEffect } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

type Props = {
  progress: number;
  color?: string;
  height?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AnimatedProgressBar({
  progress,
  color = colors.star,
  height = 3,
  trackColor = colors.border,
  style,
  testID,
}: Props) {
  const fill = useSharedValue(0);

  useEffect(() => {
    const p = Math.min(1, Math.max(0, progress));
    fill.value = withTiming(p, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [progress, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.value }],
  }));

  const radius = Math.max(2, Math.round(height / 2));

  return (
    <View
      testID={testID}
      style={[
        {
          height,
          backgroundColor: trackColor,
          borderRadius: radius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height,
            width: "100%",
            backgroundColor: color,
            borderRadius: radius,
            transformOrigin: "left",
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
