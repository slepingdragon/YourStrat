import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

// LAW-3 #1 state-flip spring (300ms, the universal Headspace easing). Same curve
// as every other state transition in the app; weighted, never bouncy (NFR10).
const PILL_EASING = Easing.bezier(0.32, 0.72, 0, 1);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PillOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: PillOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Spoken name for the whole group (exposed as a radiogroup). */
  accessibilityLabel?: string;
};

/**
 * Compact horizontal single-select (AP-10) — the few-choice alternative to a
 * stack of `OptionCard`s. Selected pill = `star`-filled with `bg` text;
 * unselected = `border`-outlined with `textSecondary`. Selection animates via
 * the LAW-3 state-flip spring and fires a selection haptic.
 */
export function PillRow<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: "row", gap: 8 }}
    >
      {options.map((opt) => (
        <Pill
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(opt.value);
          }}
        />
      ))}
    </View>
  );
}

function Pill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 300, easing: PILL_EASING });
  }, [selected, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.star]),
  }));
  const fillStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.textSecondary, colors.bg]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        {
          flex: 1,
          minHeight: 48,
          borderRadius: 999,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 12,
          overflow: "hidden",
        },
        containerStyle,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.star, borderRadius: 999 }, fillStyle]}
      />
      <Animated.Text numberOfLines={1} style={[{ fontSize: 15, fontWeight: "600" }, textStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}
