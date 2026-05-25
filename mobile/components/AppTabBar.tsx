import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

// Width of the gliding active-tab indicator pill (centered over the active tab).
const INDICATOR_W = 28;
// LAW-3 universal Headspace curve — the indicator glides weighted, not bouncy.
const GLIDE = { duration: 300, easing: Easing.bezier(0.32, 0.72, 0, 1) };

/**
 * Custom bottom tab bar (W: "pop + gliding indicator"). A `star` pill sits at the
 * top edge and glides to the active tab on the universal easing; the per-tab
 * icons do a springy pop (see AnimatedTabIcon in the tabs layout). Every press
 * fires a selection haptic. Reproduces the prior tabBarStyle 1:1.
 */
export function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = state.routes.length > 0 ? barWidth / state.routes.length : 0;

  const indicatorX = useSharedValue(0);
  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withTiming(state.index * tabWidth + tabWidth / 2, GLIDE);
    }
  }, [state.index, tabWidth, indicatorX]);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value - INDICATOR_W / 2 }],
  }));

  return (
    <View
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: StyleSheet.hairlineWidth,
        height: 72 + insets.bottom,
        paddingTop: 4,
        paddingBottom: insets.bottom + 10,
      }}
    >
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: INDICATOR_W,
              height: 3,
              borderRadius: 999,
              backgroundColor: colors.star,
            },
            indicatorStyle,
          ]}
        />
      ) : null}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? colors.star : colors.textSecondary;
        const label = typeof options.title === "string" ? options.title : route.name;

        const onPress = () => {
          Haptics.selectionAsync();
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label || route.name}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 }}
          >
            {options.tabBarIcon?.({ focused, color, size: 20 })}
            {label ? (
              <Text style={{ fontSize: 11, fontWeight: "600", color, marginTop: -2 }}>{label}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
