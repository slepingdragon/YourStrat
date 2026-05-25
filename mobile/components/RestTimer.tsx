import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

type Props = {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
  paused?: boolean;
  /** Peripheral strip layout (5.7) — a slim bar that sits alongside the logging
   * UI instead of taking over the screen. Default `false` = the full block. */
  compact?: boolean;
};

function fmt(s: number): string {
  if (s < 60) return `${s}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function RestTimer({ seconds, onDone, onSkip, paused = false, compact = false }: Props) {
  const t = useT();
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

  if (compact) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          marginTop: spacing.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.pill,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>
          {t("session.restLabel")}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            minWidth: 44,
          }}
          accessibilityLiveRegion="polite"
          accessibilityLabel={t("session.restRemainingA11y", { n: left })}
        >
          {fmt(left)}
        </Text>
        <View
          style={{
            flex: 1,
            height: 4,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.pill,
            overflow: "hidden",
          }}
        >
          <View style={{ height: "100%", width: `${pct * 100}%`, backgroundColor: colors.star }} />
        </View>
        <Pressable onPress={onSkip} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("session.skipRest")}>
          <Text style={{ color: colors.spark, fontSize: 14, fontWeight: "600" }}>{t("session.skip")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
      <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>{t("session.restWord")}</Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 64,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
        accessibilityLiveRegion="polite"
        accessibilityLabel={t("session.secondsRemainingA11y", { n: left })}
      >
        {t("session.restSeconds", { n: left })}
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
        <Button label={t("session.skipRest")} variant="secondary" onPress={onSkip} />
      </View>
    </View>
  );
}
