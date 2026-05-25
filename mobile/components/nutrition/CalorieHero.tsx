import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 200;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

type Props = {
  consumed: number;
  burned: number;
  target: number;
  onPress?: () => void;
};

function CalorieHeroImpl({ consumed, burned, target, onPress }: Props) {
  const t = useT();
  const netConsumed = consumed - burned;
  const over = target > 0 && netConsumed > target;
  const remaining = Math.max(target - netConsumed, 0);
  const overAmount = Math.max(netConsumed - target, 0);
  const progress = target > 0 ? Math.min(1, Math.max(0, netConsumed / target)) : 0;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedRingProps = useAnimatedProps(() => {
    const len = CIRC * animatedProgress.value;
    return {
      strokeDasharray: `${len} ${CIRC - len}`,
    };
  });

  const ringColor = over ? colors.error : colors.star;
  const numberColor = over ? colors.error : colors.textPrimary;
  const headline = over ? formatKcal(overAmount) : formatKcal(remaining);
  const headlineLabel = over ? t("today.caloriesOver") : t("today.caloriesLeft");

  const inner = (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        paddingVertical: 16,
      }}
    >
      <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.surfaceElevated}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
            animatedProps={animatedRingProps}
          />
        </Svg>
        <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
          <Text
            style={{
              color: numberColor,
              fontSize: 56,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -2,
              lineHeight: 60,
            }}
            numberOfLines={1}
            accessibilityLabel={`${headline} ${headlineLabel}`.trim()}
          >
            {headline}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: 4,
              letterSpacing: 0.4,
            }}
          >
            {headlineLabel}
          </Text>
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
        {burned > 0
          ? t("nutrition.eatenBurned", { kcal: formatKcal(consumed), burned: formatKcal(burned) })
          : t("nutrition.eaten", { kcal: formatKcal(consumed) })}
        {t("nutrition.calTargetSuffix", { kcal: formatKcal(target) })}
      </Text>
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("nutrition.calorieHeroA11y", { headline, label: headlineLabel })}
    >
      {({ pressed }) => <View style={{ opacity: pressed ? 0.85 : 1 }}>{inner}</View>}
    </Pressable>
  );
}

export const CalorieHero = memo(CalorieHeroImpl);
