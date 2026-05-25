import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useT } from "@/lib/i18n";
import type { PaceState } from "@/lib/pace";

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
  // Pace Ring (opt-in; only the Today hero passes these). When both are set,
  // the ring draws the gap arc + tonal shift. Default off keeps every other
  // IntakeRing consumer (macro rings, nutrition panels) pixel-identical.
  paceMark?: number; // 0..1 pace position
  paceState?: PaceState;
  animated?: boolean;
  accessibilityLabel?: string;
  /** Full-circle background track color. Default is the subtle border; the
   * Today hero passes a more visible grey so the complete circle always reads
   * (otherwise only the lit arcs show and the ring looks off-center). */
  trackColor?: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

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
  paceMark,
  paceState,
  animated = false,
  accessibilityLabel,
  trackColor = colors.border,
}: Props) {
  const tr = useT();
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

  const paceActive = paceMark != null && paceState != null;
  const paceLen = paceActive ? circ * clamp01(paceMark as number) : 0;

  // Tonal shift only when pace is active (never affects non-hero consumers).
  const fillColor = paceActive
    ? over || paceState === "over"
      ? overColor
      : paceState === "ahead"
        ? colors.starDim
        : color
    : color;

  // Gap arc: behind = warm arc beyond the fill (fill endpoint → pace);
  // ahead = cool overlay (pace → fill endpoint). None on/over.
  const showWarm = paceActive && paceState === "behind" && paceLen > inLen;
  const showCool = paceActive && paceState === "ahead" && inLen > paceLen;
  const warmLen = showWarm ? paceLen - inLen : 0;
  const coolLen = showCool ? inLen - paceLen : 0;

  // Reduced-motion: detected once; when true we render at final geometry.
  // Gated on `animated` so the 3 non-hero (static) consumers stay exactly as
  // before — no SR query, no extra re-render (AC1 regression safety).
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    if (!animated) return;
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    return () => {
      mounted = false;
    };
  }, [animated]);

  // Animation shared values (only drive the rendered output when `animated`).
  const drawn = useSharedValue(0);
  const gapOpacity = useSharedValue(0);
  const firstRun = useRef(true);
  useEffect(() => {
    if (!animated) return;
    if (reduceMotion) {
      drawn.value = inLen;
      gapOpacity.value = 1;
      firstRun.current = false;
      return;
    }
    const mount = firstRun.current;
    drawn.value = withTiming(inLen, {
      duration: mount ? 400 : 300,
      easing: Easing.out(Easing.cubic),
    });
    gapOpacity.value = mount
      ? withDelay(200, withTiming(1, { duration: 200 }))
      : withTiming(1, { duration: 200 });
    firstRun.current = false;
  }, [animated, reduceMotion, inLen, drawn, gapOpacity]);

  const fillAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${drawn.value} ${Math.max(0, circ - drawn.value)}`,
  }));
  const gapAnimatedProps = useAnimatedProps(() => ({ opacity: gapOpacity.value }));

  return (
    <View
      style={{ alignItems: "center", width: size + 8, minHeight: hideLabel ? size : size + 36 }}
      accessible={accessibilityLabel ? true : undefined}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          <Circle cx={cx} cy={cx} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />

          {/* behind: warm gap arc (under fill, but beyond the fill end → visible) */}
          {showWarm ? (
            animated ? (
              <AnimatedCircle
                cx={cx}
                cy={cx}
                r={r}
                stroke={colors.paceWarmGap}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${warmLen} ${circ - warmLen}`}
                strokeDashoffset={-inLen}
                rotation={-90}
                origin={`${cx}, ${cx}`}
                animatedProps={gapAnimatedProps}
              />
            ) : (
              <Circle
                cx={cx}
                cy={cx}
                r={r}
                stroke={colors.paceWarmGap}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${warmLen} ${circ - warmLen}`}
                strokeDashoffset={-inLen}
                rotation={-90}
                origin={`${cx}, ${cx}`}
              />
            )
          ) : null}

          {/* fill (consumed) */}
          {inLen > 0 ? (
            animated ? (
              <AnimatedCircle
                cx={cx}
                cy={cx}
                r={r}
                stroke={fillColor}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDashoffset={0}
                rotation={-90}
                origin={`${cx}, ${cx}`}
                animatedProps={fillAnimatedProps}
              />
            ) : (
              <Circle
                cx={cx}
                cy={cx}
                r={r}
                stroke={fillColor}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${inLen} ${circ - inLen}`}
                strokeDashoffset={0}
                rotation={-90}
                origin={`${cx}, ${cx}`}
              />
            )
          ) : null}

          {/* ahead: cool gap arc overlay (pace → fill end, on top of the fill) */}
          {showCool ? (
            animated ? (
              <AnimatedCircle
                cx={cx}
                cy={cx}
                r={r}
                stroke={colors.paceCoolGap}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${coolLen} ${circ - coolLen}`}
                strokeDashoffset={-paceLen}
                rotation={-90}
                origin={`${cx}, ${cx}`}
                animatedProps={gapAnimatedProps}
              />
            ) : (
              <Circle
                cx={cx}
                cy={cx}
                r={r}
                stroke={colors.paceCoolGap}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${coolLen} ${circ - coolLen}`}
                strokeDashoffset={-paceLen}
                rotation={-90}
                origin={`${cx}, ${cx}`}
              />
            )
          ) : null}

          {/* over-target arc (unchanged) */}
          {overLen > 0 ? (
            <Circle
              cx={cx}
              cy={cx}
              r={r}
              stroke={overColor}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${overLen} ${circ - overLen}`}
              strokeDashoffset={-inLen}
              rotation={-90}
              origin={`${cx}, ${cx}`}
            />
          ) : null}
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
        <Text style={{ color: overColor, fontSize: 10, fontWeight: "600", marginTop: spacing.xs }}>{tr("metric.overLimit")}</Text>
      ) : null}
    </View>
  );
}
