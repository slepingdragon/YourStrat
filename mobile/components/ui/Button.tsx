import { ActivityIndicator, Platform, Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = "primary", disabled, loading, compact }: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg = variant === "primary" ? colors.star : "transparent";
  const fg = variant === "primary" ? colors.bg : variant === "ghost" ? colors.textSecondary : colors.textPrimary;
  const borderWidth = variant === "secondary" ? 2 : 0;
  const borderColor = variant === "secondary" ? colors.star : "transparent";

  return (
    <AnimatedPressable
      onPress={() => {
        if (isDisabled) return;
        if (variant === "primary") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      onPressIn={() => {
        if (!isDisabled) scale.value = withTiming(0.95, { duration: 200 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 200 });
      }}
      disabled={isDisabled}
      style={[
        {
          backgroundColor: bg,
          borderColor,
          borderWidth,
          opacity: isDisabled ? 0.4 : 1,
          borderRadius: 999,
          minHeight: compact ? 48 : 56,
          paddingHorizontal: compact ? 20 : 24,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          ...(Platform.OS === "web" ? { cursor: isDisabled ? "not-allowed" : "pointer" } : {}),
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontSize: compact ? 15 : 17, fontWeight: "700" }}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}
