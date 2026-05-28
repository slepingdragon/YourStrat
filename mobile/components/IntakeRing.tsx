import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Unit = "cal" | "g" | "mg";

type Props = {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: Unit;
  size?: number;
  overColor?: string;
  hideCenter?: boolean;
  hideLabel?: boolean;
  animated?: boolean;
  /** Soft halo bloom on the entire progress arc (the ring itself glows). */
  glow?: boolean;
};

function formatCenter(value: number, target: number, unit: Unit) {
  const v = unit === "cal" ? Math.round(value) : Math.round(value);
  const t = unit === "cal" ? Math.round(target) : Math.round(target);
  const suffix = unit === "cal" ? "" : unit === "mg" ? "mg" : "g";
  return { main: `${v}`, sub: `/ ${t}${suffix}` };
}

export function IntakeRing({
  label,
  value,
  target,
  color,
  unit = "g",
  size = 88,
  overColor = colors.error,
  hideCenter = false,
  hideLabel = false,
  animated = false,
  glow = false,
}: Props) {
  const stroke = Math.max(6, Math.round(size * 0.09));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = target > 0 ? value / target : 0;
  const inTarget = Math.min(1, Math.max(0, ratio));
  const overRatio = ratio > 1 ? Math.min(1, ratio - 1) : 0;
  const inLen = circ * inTarget;
  const overLen = circ * overRatio;
  const cx = size / 2;
  const over = ratio > 1;
  const { main, sub } = formatCenter(value, target, unit);

  const animatedIn = useSharedValue(animated ? 0 : inTarget);
  const animatedOver = useSharedValue(animated ? 0 : overRatio);

  useEffect(() => {
    if (!animated) return;
    animatedIn.value = withTiming(inTarget, { duration: 700, easing: Easing.out(Easing.cubic) });
    animatedOver.value = withTiming(overRatio, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [animated, inTarget, overRatio, animatedIn, animatedOver]);

  const inStrokeProps = useAnimatedProps(() => {
    const len = circ * animatedIn.value;
    return { strokeDasharray: `${len} ${circ - len}` };
  });

  const overStrokeProps = useAnimatedProps(() => {
    const inLenAnim = circ * animatedIn.value;
    const len = circ * animatedOver.value;
    return {
      strokeDasharray: `${len} ${circ - len}`,
      strokeDashoffset: -inLenAnim,
    };
  });

  const haloOuterWidth = stroke * 1.95;
  const haloInnerWidth = stroke * 1.4;
  const haloOuterOpacity = 0.14;
  const haloInnerOpacity = 0.28;

  const renderHaloPair = (strokeColor: string, animatedProps: typeof inStrokeProps) => (
    <>
      <AnimatedCircle
        cx={cx}
        cy={cx}
        r={r}
        stroke={strokeColor}
        strokeOpacity={haloOuterOpacity}
        strokeWidth={haloOuterWidth}
        fill="none"
        strokeLinecap="butt"
        rotation={-90}
        origin={`${cx}, ${cx}`}
        animatedProps={animatedProps}
      />
      <AnimatedCircle
        cx={cx}
        cy={cx}
        r={r}
        stroke={strokeColor}
        strokeOpacity={haloInnerOpacity}
        strokeWidth={haloInnerWidth}
        fill="none"
        strokeLinecap="butt"
        rotation={-90}
        origin={`${cx}, ${cx}`}
        animatedProps={animatedProps}
      />
    </>
  );

  const renderStaticHaloPair = (
    strokeColor: string,
    dashLen: number,
    dashOffset: number,
  ) => (
    <>
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={strokeColor}
        strokeOpacity={haloOuterOpacity}
        strokeWidth={haloOuterWidth}
        fill="none"
        strokeLinecap="butt"
        strokeDasharray={`${dashLen} ${circ - dashLen}`}
        strokeDashoffset={dashOffset}
        rotation={-90}
        origin={`${cx}, ${cx}`}
      />
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={strokeColor}
        strokeOpacity={haloInnerOpacity}
        strokeWidth={haloInnerWidth}
        fill="none"
        strokeLinecap="butt"
        strokeDasharray={`${dashLen} ${circ - dashLen}`}
        strokeDashoffset={dashOffset}
        rotation={-90}
        origin={`${cx}, ${cx}`}
      />
    </>
  );

  return (
    <View style={{ alignItems: "center", width: size + 8, minHeight: hideLabel ? size : size + 36 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ position: "absolute", overflow: "visible" }}>
          <Circle cx={cx} cy={cx} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
          {animated ? (
            <>
              {glow ? renderHaloPair(color, inStrokeProps) : null}
              <AnimatedCircle
                cx={cx}
                cy={cx}
                r={r}
                stroke={color}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="butt"
                rotation={-90}
                origin={`${cx}, ${cx}`}
                animatedProps={inStrokeProps}
              />
              {overRatio > 0 ? (
                <>
                  {glow ? renderHaloPair(overColor, overStrokeProps) : null}
                  <AnimatedCircle
                    cx={cx}
                    cy={cx}
                    r={r}
                    stroke={overColor}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="butt"
                    rotation={-90}
                    origin={`${cx}, ${cx}`}
                    animatedProps={overStrokeProps}
                  />
                </>
              ) : null}
            </>
          ) : (
            <>
              {inLen > 0 ? (
                <>
                  {glow ? renderStaticHaloPair(color, inLen, 0) : null}
                  <Circle
                    cx={cx}
                    cy={cx}
                    r={r}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="butt"
                    strokeDasharray={`${inLen} ${circ - inLen}`}
                    strokeDashoffset={0}
                    rotation={-90}
                    origin={`${cx}, ${cx}`}
                  />
                </>
              ) : null}
              {overLen > 0 ? (
                <>
                  {glow ? renderStaticHaloPair(overColor, overLen, -inLen) : null}
                  <Circle
                    cx={cx}
                    cy={cx}
                    r={r}
                    stroke={overColor}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="butt"
                    strokeDasharray={`${overLen} ${circ - overLen}`}
                    strokeDashoffset={-inLen}
                    rotation={-90}
                    origin={`${cx}, ${cx}`}
                  />
                </>
              ) : null}
            </>
          )}
        </Svg>
        {hideCenter ? null : (
          <View style={{ alignItems: "center", paddingHorizontal: 4 }}>
            <Text
              style={{
                color: over ? overColor : colors.textPrimary,
                fontWeight: "700",
                fontSize: Math.max(12, Math.round(size * 0.16)),
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
            >
              {main}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Math.max(9, Math.round(size * 0.11)),
                fontVariant: ["tabular-nums"],
              }}
            >
              {sub}
            </Text>
          </View>
        )}
      </View>
      {hideLabel ? null : (
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6, textAlign: "center" }}>{label}</Text>
      )}
      {!hideLabel && over ? (
        <Text style={{ color: overColor, fontSize: 10, fontWeight: "600", marginTop: 2 }}>Over limit</Text>
      ) : null}
    </View>
  );
}
