import { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: object;
};

export function Skeleton({ width = "100%", height = 16, radius = 8, style }: Props) {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surfaceElevated },
        animatedStyle,
        style,
      ]}
    />
  );
}
