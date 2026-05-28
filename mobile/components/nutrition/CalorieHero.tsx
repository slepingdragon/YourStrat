import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { IntakeRing } from "@/components/IntakeRing";
import { CalorieHeroHeadline } from "@/components/today/CalorieHeroHeadline";
import { HeroBloomAura } from "@/components/today/HeroBloomAura";
import {
  calorieOverSeverity,
  overStrokeColorForCalories,
  ringColorForCalories,
} from "@/lib/calorieHeroVisuals";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const SIZE = 200;

type Props = {
  consumed: number;
  burned: number;
  target: number;
  onPress?: () => void;
};

function CalorieHeroImpl({ consumed, burned, target, onPress }: Props) {
  const netConsumed = consumed - burned;
  const over = target > 0 && netConsumed > target;
  const remaining = Math.max(target - netConsumed, 0);
  const overAmount = Math.max(netConsumed - target, 0);
  const headline = over ? Math.round(overAmount).toLocaleString() : Math.round(remaining).toLocaleString();
  const headlineLabel = over ? "calories over" : "calories left";
  const severity = calorieOverSeverity(netConsumed, target);

  const inner = (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        paddingVertical: 16,
      }}
    >
      <View
        style={{
          width: SIZE + 80,
          height: SIZE + 40,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <HeroBloomAura size={SIZE} overSeverity={severity} />
        <View style={{ position: "absolute", width: SIZE, height: SIZE }}>
          <IntakeRing
            label=""
            value={netConsumed}
            target={target}
            color={ringColorForCalories(netConsumed, target)}
            overColor={overStrokeColorForCalories(netConsumed, target)}
            unit="cal"
            size={SIZE}
            hideCenter
            hideLabel
            animated
            glow
          />
        </View>
        <View style={{ alignItems: "center", paddingHorizontal: spacing.sm, zIndex: 1 }}>
          <CalorieHeroHeadline
            value={headline}
            label={headlineLabel}
            consumed={netConsumed}
            target={target}
            over={over}
            fontSize={56}
          />
        </View>
      </View>

      <Text
        style={{
          color: colors.textMuted,
          fontSize: 13,
          marginTop: 16,
          fontVariant: ["tabular-nums"],
          textAlign: "center",
        }}
      >
        {Math.round(consumed).toLocaleString()} eaten
        {burned > 0 ? ` · ${Math.round(burned).toLocaleString()} burned` : ""}
        {` · ${Math.round(target).toLocaleString()} target`}
      </Text>
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${headline} ${headlineLabel}. Tap for calorie detail.`}
    >
      {({ pressed }) => <View style={{ opacity: pressed ? 0.85 : 1 }}>{inner}</View>}
    </Pressable>
  );
}

export const CalorieHero = memo(CalorieHeroImpl);
