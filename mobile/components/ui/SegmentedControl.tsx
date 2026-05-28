import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { glass, glassTint } from "@/theme/glass";
import { spacing } from "@/theme/spacing";

export type SegOption = { key: string; label: string };

type Props = {
  options: SegOption[];
  value: string;
  onChange: (key: string) => void;
  /** Render as a wrapping group of pills instead of one connected track.
   *  Use when there are many options or labels are too long for equal cells. */
  wrap?: boolean;
};

const TRACK_PAD = 4;
const HEIGHT = 44;

export function SegmentedControl({ options, value, onChange, wrap }: Props) {
  const [trackW, setTrackW] = useState(0);
  const tx = useSharedValue(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.key === value)
  );
  const segW = trackW > 0 ? (trackW - TRACK_PAD * 2) / options.length : 0;

  useEffect(() => {
    tx.value = withTiming(index * segW, { duration: 200 });
  }, [index, segW, tx]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const select = (key: string) => {
    Haptics.selectionAsync();
    onChange(key);
  };

  if (wrap) {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const selected = o.key === value;
          return (
            <Pressable
              key={o.key}
              onPress={() => select(o.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              style={{
                paddingHorizontal: spacing.lg,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected ? colors.star : glass.chipFill,
                borderWidth: 1,
                borderColor: selected ? colors.star : glass.border,
              }}
            >
              <Text
                style={{ color: selected ? colors.bg : colors.textSecondary, fontSize: 14, fontWeight: "600" }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width)}
      style={[
        {
          flexDirection: "row",
          borderWidth: 1,
          borderColor: glass.border,
          borderRadius: 999,
          padding: TRACK_PAD,
          height: HEIGHT,
          overflow: "hidden",
        },
        glassTint("track"),
      ]}
    >
      {segW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: TRACK_PAD,
              left: TRACK_PAD,
              width: segW,
              height: HEIGHT - TRACK_PAD * 2,
              borderRadius: 999,
              backgroundColor: colors.star,
            },
            thumbStyle,
          ]}
        />
      ) : null}
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => select(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: selected ? colors.bg : colors.textSecondary,
                fontSize: 15,
                fontWeight: selected ? "700" : "600",
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
