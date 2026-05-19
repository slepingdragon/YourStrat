import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

const GLASS_COUNT = 8;
const STORAGE_PREFIX = "yourstrat_water_";

function storageKey(dateKey: string) {
  return `${STORAGE_PREFIX}${dateKey}`;
}

function Stepper({
  disabled,
  onPress,
  label,
  glyph,
}: {
  disabled: boolean;
  onPress: () => void;
  label: string;
  glyph: "−" | "+";
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: disabled ? "transparent" : colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.6 : disabled ? 0.4 : 1,
      })}
    >
      <Text
        style={{
          color: disabled ? colors.textMuted : colors.textPrimary,
          fontSize: 20,
          fontWeight: "600",
          lineHeight: 22,
          marginTop: -2,
        }}
      >
        {glyph}
      </Text>
    </Pressable>
  );
}

type Props = {
  dateKey: string;
};

export function WaterRow({ dateKey }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey(dateKey)).then((raw) => {
      if (cancelled) return;
      const n = raw ? parseInt(raw, 10) : 0;
      setCount(Number.isFinite(n) ? Math.max(0, Math.min(GLASS_COUNT, n)) : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const persist = useCallback(
    (next: number) => {
      AsyncStorage.setItem(storageKey(dateKey), String(next)).catch(() => {
        /* ignore */
      });
    },
    [dateKey]
  );

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(GLASS_COUNT, count + delta));
    if (next === count) return;
    if (next === GLASS_COUNT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (delta > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
    setCount(next);
    persist(next);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
            Water
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
              fontVariant: ["tabular-nums"],
            }}
          >
            {count} / {GLASS_COUNT} glasses
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Stepper
            disabled={count === 0}
            onPress={() => step(-1)}
            label="Remove a glass"
            glyph="−"
          />
          <Stepper
            disabled={count === GLASS_COUNT}
            onPress={() => step(1)}
            label="Add a glass"
            glyph="+"
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          marginTop: 12,
        }}
        accessibilityLabel={`${count} of ${GLASS_COUNT} glasses logged`}
      >
        {Array.from({ length: GLASS_COUNT }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              backgroundColor: i < count ? colors.spark : colors.surfaceElevated,
            }}
          />
        ))}
      </View>
    </View>
  );
}
