import { ActivityIndicator, Platform, Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  /** Overrides the spoken label (e.g. "Delete routine Push Day" when the
   *  visible label is just "Delete"). Defaults to `label`. */
  accessibilityLabel?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  compact,
  fullWidth = true,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg = variant === "primary" ? colors.star : "transparent";
  const fg =
    variant === "primary"
      ? colors.bg
      : variant === "ghost"
        ? colors.textSecondary
        : variant === "destructive"
          ? colors.urgent
          : colors.textPrimary; // secondary
  const outlined = variant === "secondary" || variant === "destructive";
  const borderWidth = outlined ? 2 : 0;
  const borderColor = variant === "destructive" ? colors.urgent : variant === "secondary" ? colors.star : "transparent";

  return (
    <AnimatedPressable
      onPress={() => {
        if (isDisabled) return;
        if (variant === "primary") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (variant === "destructive") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
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
          ...(fullWidth ? { width: "100%" } : { alignSelf: "flex-start" }),
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
