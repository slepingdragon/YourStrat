import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";

type Props = { seconds: number; onDone: () => void; onSkip: () => void; paused?: boolean };

export function RestTimer({ seconds, onDone, onSkip, paused = false }: Props) {
  const [left, setLeft] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    firedRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onDone();
      }
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, paused, onDone]);

  const pct = Math.max(0, Math.min(1, seconds > 0 ? left / seconds : 0));

  return (
    <View style={{ alignItems: "center", paddingVertical: 24 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Rest</Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 64,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${left} seconds remaining`}
      >
        {left}s
      </Text>
      <View
        style={{
          marginTop: 16,
          height: 4,
          width: "80%",
          backgroundColor: colors.surfaceElevated,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            backgroundColor: colors.star,
          }}
        />
      </View>
      <View style={{ marginTop: 24, width: "100%" }}>
        <Button label="Skip rest" variant="secondary" onPress={onSkip} />
      </View>
    </View>
  );
}
