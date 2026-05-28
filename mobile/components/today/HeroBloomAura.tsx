import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors } from "@/theme/colors";
import { lerpHex } from "@/lib/calorieHeroVisuals";

type BloomSpec = { fx: number; fy: number; r: number; peak: number };

const BLOOMS: BloomSpec[] = [
  { fx: 0.22, fy: 0.42, r: 0.38, peak: 0.16 },
  { fx: 0.78, fy: 0.48, r: 0.36, peak: 0.14 },
  { fx: 0.5, fy: 0.72, r: 0.32, peak: 0.11 },
];

type Props = {
  size: number;
  /** 0 = on track (white blooms), 1 = strongly over (red-tinted blooms). */
  overSeverity?: number;
};

export function HeroBloomAura({ size, overSeverity = 0 }: Props) {
  const breath = useSharedValue(0.85);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [breath]);

  const auraStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + breath.value * 0.22,
  }));

  const pad = size * 0.4;
  const canvas = size + pad * 2;
  const s = Math.min(1, Math.max(0, overSeverity));
  const core = lerpHex(colors.star, colors.error, s * 0.85);
  const halo = lerpHex(colors.starDim, colors.error, s * 0.65);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: canvas,
          height: canvas,
          left: (size - canvas) / 2,
          top: (size - canvas) / 2,
        },
        auraStyle,
      ]}
    >
      <Svg width={canvas} height={canvas}>
        <Defs>
          {BLOOMS.map((b, i) => (
            <RadialGradient key={`bloom${i}`} id={`heroBloom${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={core} stopOpacity={b.peak * (1 + s * 0.25)} />
              <Stop offset="0.4" stopColor={halo} stopOpacity={b.peak * 0.35 * (1 + s * 0.2)} />
              <Stop offset="1" stopColor={core} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {BLOOMS.map((b, i) => {
          const cx = b.fx * canvas;
          const cy = b.fy * canvas;
          const radius = b.r * canvas;
          return <Circle key={`bloomb${i}`} cx={cx} cy={cy} r={radius} fill={`url(#heroBloom${i})`} />;
        })}
      </Svg>
    </Animated.View>
  );
}
