import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export type TrendPoint = {
  date: string;
  value: number;
};

type Props = {
  data: TrendPoint[];
  target: number;
  avg: number;
  /** Total chart height (incl. axis labels). */
  height?: number;
  /** Tighter padding + smaller text + no X-axis labels. */
  compact?: boolean;
  lineColor?: string;
  /** Hide axis labels entirely (overrides compact's tiny labels). */
  hideAxes?: boolean;
  /** Suffix to append to Y-axis tick values (e.g. " cal", "g"). */
  unitSuffix?: string;
  onScrubChange?: (point: TrendPoint | null) => void;
};

type ChartPoint = TrendPoint & {
  x: number;
  y: number;
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function smoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Picks a round, "nice" upper bound + step for a numeric axis, so tick labels
 * end at 1000 / 500 / 50 / 10 rather than 2347.
 */
function niceAxis(maxValue: number): { max: number; step: number } {
  if (maxValue <= 0) return { max: 100, step: 25 };
  const exponent = Math.floor(Math.log10(maxValue));
  const base = Math.pow(10, exponent);
  const fraction = maxValue / base;
  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  const niceMax = niceFraction * base;
  return { max: niceMax, step: niceMax / 4 };
}

function formatTick(value: number, suffix: string): string {
  const abs = Math.abs(value);
  let body: string;
  if (abs >= 1000) {
    const k = value / 1000;
    body = Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  } else {
    body = `${Math.round(value)}`;
  }
  return `${body}${suffix}`;
}

function formatDateShort(dateKey: string): string {
  // dateKey is YYYY-MM-DD
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [, m, d] = dateKey.split("-");
  const mi = parseInt(m, 10) - 1;
  return `${months[mi] ?? m} ${parseInt(d, 10)}`;
}

function pickDateTicks(data: TrendPoint[], maxTicks: number): TrendPoint[] {
  if (data.length === 0) return [];
  if (data.length <= maxTicks) return data;
  const out: TrendPoint[] = [];
  const span = data.length - 1;
  for (let i = 0; i < maxTicks; i++) {
    const idx = Math.round((i / (maxTicks - 1)) * span);
    out.push(data[idx]);
  }
  return out;
}

function TrendChartImpl({
  data,
  target,
  avg,
  height = 220,
  compact = false,
  lineColor = colors.spark,
  hideAxes = false,
  unitSuffix = "",
  onScrubChange,
}: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, data.length - 1));

  const showAxes = !hideAxes;
  const yAxisWidth = showAxes ? (compact ? 28 : 36) : spacing.xs;
  const xAxisHeight = showAxes && !compact ? 22 : 0;
  const topPad = compact ? spacing.xs : spacing.md;
  const bottomPad = (compact ? spacing.xs : spacing.sm) + xAxisHeight;
  const rightPad = compact ? spacing.xs : spacing.md;
  const drawWidth = Math.max(1, width - yAxisWidth - rightPad);
  const drawHeight = Math.max(1, height - topPad - bottomPad);
  const drawLeftX = yAxisWidth;
  const drawRightX = drawLeftX + drawWidth;
  const drawBottomY = topPad + drawHeight;

  const localMax = useMemo(() => data.reduce((m, p) => Math.max(m, p.value), 0), [data]);
  const niceMax = useMemo(() => {
    const candidate = Math.max(localMax, target, avg);
    return niceAxis(candidate * 1.05).max;
  }, [avg, localMax, target]);
  const yStep = niceMax / 4;
  const yTickValues = useMemo(() => [0, yStep, yStep * 2, yStep * 3, yStep * 4], [yStep]);

  const valueToY = useCallback(
    (value: number) => drawBottomY - (niceMax > 0 ? value / niceMax : 0) * drawHeight,
    [drawBottomY, drawHeight, niceMax],
  );

  const points = useMemo<ChartPoint[]>(() => {
    if (!data.length || width <= 0) return [];
    const denom = Math.max(data.length - 1, 1);
    return data.map((item, i) => {
      const x = drawLeftX + (i / denom) * drawWidth;
      const y = valueToY(item.value);
      return { ...item, x, y };
    });
  }, [data, drawLeftX, drawWidth, valueToY, width]);

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (!points.length || !linePath) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${drawBottomY} L ${first.x} ${drawBottomY} Z`;
  }, [drawBottomY, linePath, points]);

  const targetY = useMemo(() => (target > 0 ? valueToY(target) : null), [target, valueToY]);
  const avgY = useMemo(() => (avg > 0 ? valueToY(avg) : null), [avg, valueToY]);

  useEffect(() => {
    const next = Math.max(0, points.length - 1);
    setActiveIndex((current) => clamp(current, 0, next));
  }, [points.length]);

  const activePoint = points.length ? points[activeIndex] : null;
  const scrubX = useSharedValue(activePoint?.x ?? drawLeftX);
  const scrubOpacity = useSharedValue(0);

  useEffect(() => {
    if (activePoint) scrubX.value = activePoint.x;
  }, [activePoint, scrubX]);

  useEffect(() => {
    onScrubChange?.(activePoint ? { date: activePoint.date, value: activePoint.value } : null);
  }, [activePoint, onScrubChange]);

  const updateFromX = useCallback(
    (x: number) => {
      if (!points.length || drawWidth <= 0) return;
      const clamped = clamp(x, drawLeftX, drawRightX);
      scrubX.value = clamped;
      const ratio = (clamped - drawLeftX) / drawWidth;
      const index = clamp(Math.round(ratio * Math.max(0, points.length - 1)), 0, points.length - 1);
      setActiveIndex(index);
    },
    [drawLeftX, drawRightX, drawWidth, points.length, scrubX],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!compact && points.length > 0)
        .runOnJS(true)
        .onStart((e) => {
          scrubOpacity.value = withTiming(1, { duration: 120 });
          updateFromX(e.x);
        })
        .onUpdate((e) => {
          updateFromX(e.x);
        })
        .onEnd(() => {
          scrubOpacity.value = withTiming(0, { duration: 150 });
        }),
    [compact, points.length, scrubOpacity, updateFromX],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(!compact && points.length > 0)
        .runOnJS(true)
        .onStart((e) => {
          scrubOpacity.value = withTiming(1, { duration: 100 });
          updateFromX(e.x);
        })
        .onEnd(() => {
          scrubOpacity.value = withTiming(0, { duration: 220 });
        }),
    [compact, points.length, scrubOpacity, updateFromX],
  );

  const scrubLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrubX.value }],
    opacity: scrubOpacity.value,
  }));

  const scrubDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrubX.value - spacing.sm }],
    opacity: scrubOpacity.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const yLabelColor = colors.textMuted;
  const yLabelSize = compact ? 9 : 11;
  const xLabelSize = 10;
  const targetLabelSize = compact ? 9 : 10;
  const dateTicks = useMemo(
    () => (showAxes && !compact ? pickDateTicks(data, 4) : []),
    [compact, data, showAxes],
  );

  return (
    <View onLayout={onLayout} style={{ width: "100%", height, borderRadius: radius.lg }}>
      <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
        <View style={{ flex: 1 }}>
          <Svg width={Math.max(1, width)} height={height}>
            <Defs>
              <LinearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity={compact ? 0.18 : 0.24} />
                <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {/* Y-axis gridlines + tick labels (skipping bottom 0 line). */}
            {showAxes
              ? yTickValues.map((tick, i) => {
                  const y = valueToY(tick);
                  return (
                    <Line
                      key={`grid-${i}`}
                      x1={drawLeftX}
                      y1={y}
                      x2={drawRightX}
                      y2={y}
                      stroke={colors.border}
                      strokeWidth={1}
                      opacity={i === 0 ? 0.5 : 0.18}
                    />
                  );
                })
              : null}

            {showAxes
              ? yTickValues.map((tick, i) => (
                  <SvgText
                    key={`ytick-${i}`}
                    x={drawLeftX - 6}
                    y={valueToY(tick) + 3}
                    fill={yLabelColor}
                    fontSize={yLabelSize}
                    textAnchor="end"
                  >
                    {formatTick(tick, unitSuffix)}
                  </SvgText>
                ))
              : null}

            {/* X-axis date labels (full mode only). */}
            {showAxes && !compact
              ? dateTicks.map((tick, i) => {
                  const idx = data.findIndex((d) => d.date === tick.date);
                  if (idx < 0 || points.length === 0) return null;
                  const denom = Math.max(data.length - 1, 1);
                  const x = drawLeftX + (idx / denom) * drawWidth;
                  return (
                    <SvgText
                      key={`xtick-${i}`}
                      x={x}
                      y={drawBottomY + 14}
                      fill={yLabelColor}
                      fontSize={xLabelSize}
                      textAnchor={i === 0 ? "start" : i === dateTicks.length - 1 ? "end" : "middle"}
                    >
                      {formatDateShort(tick.date)}
                    </SvgText>
                  );
                })
              : null}

            {avgY != null ? (
              <Line
                x1={drawLeftX}
                y1={avgY}
                x2={drawRightX}
                y2={avgY}
                stroke={colors.textSecondary}
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.55}
              />
            ) : null}

            {targetY != null ? (
              <>
                <Line
                  x1={drawLeftX}
                  y1={targetY}
                  x2={drawRightX}
                  y2={targetY}
                  stroke={colors.starDim}
                  strokeWidth={1}
                  strokeDasharray="4 5"
                  opacity={0.8}
                />
                <Circle cx={drawRightX} cy={targetY} r={3} fill={colors.starDim} />
                {showAxes && !compact ? (
                  <SvgText
                    x={drawRightX - 6}
                    y={targetY - 6}
                    fill={colors.textSecondary}
                    fontSize={targetLabelSize}
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {`Target ${formatTick(target, unitSuffix)}`}
                  </SvgText>
                ) : null}
              </>
            ) : null}

            {areaPath ? <Path d={areaPath} fill="url(#trendAreaFill)" /> : null}
            {linePath ? (
              <Path
                d={linePath}
                fill="none"
                stroke={lineColor}
                strokeWidth={compact ? 2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Always-visible data dots so users can see each point. */}
            {points.map((p, i) => (
              <Circle
                key={`pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={compact ? 1.8 : 2.5}
                fill={colors.bg}
                stroke={lineColor}
                strokeWidth={compact ? 1.2 : 1.6}
              />
            ))}

            {!compact && activePoint ? (
              <Circle cx={activePoint.x} cy={activePoint.y} r={5} fill={lineColor} />
            ) : null}
          </Svg>

          {!compact && activePoint ? (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: topPad,
                    bottom: bottomPad,
                    width: 1,
                    backgroundColor: colors.textSecondary,
                    opacity: 0.45,
                  },
                  scrubLineStyle,
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: activePoint.y - spacing.sm,
                    width: spacing.lg,
                    height: spacing.lg,
                    borderRadius: radius.pill,
                    backgroundColor: colors.bg,
                    borderWidth: 2,
                    borderColor: lineColor,
                  },
                  scrubDotStyle,
                ]}
              />
            </>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  );
}

export const TrendChart = memo(TrendChartImpl);
