import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import type { NutritionDay } from "@/lib/api";
import { roundCal } from "@/lib/targets";
import { colors } from "@/theme/colors";

type Props = {
  days: NutritionDay[];
  target: number;
};

const WIDTH = 340;
const HEIGHT = 64;
const PAD_X = 8;
const PAD_Y = 8;

type Point = { x: number; y: number; calories: number; date: string };

function computePoints(days: NutritionDay[], target: number): { points: (Point | null)[]; maxY: number; avg: number } {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const calories = sorted.map((d) => d.totals?.calories ?? 0);
  const target120 = target > 0 ? target * 1.2 : 2400;
  const maxY = Math.max(target120, ...calories.map((c) => c || 0));

  const xStep = sorted.length > 1 ? (WIDTH - PAD_X * 2) / (sorted.length - 1) : 0;
  const points: (Point | null)[] = sorted.map((d, i) => {
    const cal = d.totals?.calories ?? 0;
    if (cal <= 0) return null;
    const x = PAD_X + i * xStep;
    const y = HEIGHT - PAD_Y - (cal / maxY) * (HEIGHT - PAD_Y * 2);
    return { x, y, calories: cal, date: d.date };
  });

  const valid = calories.filter((c) => c > 0);
  const avg = valid.length ? valid.reduce((s, n) => s + n, 0) / valid.length : 0;
  return { points, maxY, avg };
}

function segmentString(points: (Point | null)[]): string[] {
  const segs: string[] = [];
  let current: Point[] = [];
  for (const p of points) {
    if (p) {
      current.push(p);
    } else if (current.length > 1) {
      segs.push(current.map((p2) => `${p2.x},${p2.y}`).join(" "));
      current = [];
    } else {
      current = [];
    }
  }
  if (current.length > 1) {
    segs.push(current.map((p2) => `${p2.x},${p2.y}`).join(" "));
  }
  return segs;
}

export function CalorieSparkline({ days, target }: Props) {
  const router = useRouter();
  const { points, maxY, avg } = useMemo(() => computePoints(days, target), [days, target]);

  const validCount = points.filter(Boolean).length;
  if (validCount < 2) return null;

  const segments = segmentString(points);
  const targetY = target > 0 ? HEIGHT - PAD_Y - (target / maxY) * (HEIGHT - PAD_Y * 2) : null;
  const lastPoint = [...points].reverse().find((p): p is Point => p !== null) ?? null;

  return (
    <Pressable
      onPress={() => router.push("/nutrition")}
      style={({ pressed }) => ({
        width: "100%",
        marginTop: 4,
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Last 7 days, average ${roundCal(avg)} calories`}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600" }}>Last 7 days</Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontVariant: ["tabular-nums"],
          }}
        >
          avg {roundCal(avg).toLocaleString()} cal
        </Text>
      </View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        {targetY !== null ? (
          <Line
            x1={PAD_X}
            y1={targetY}
            x2={WIDTH - PAD_X}
            y2={targetY}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="3,4"
          />
        ) : null}
        {segments.map((seg, i) => (
          <Polyline
            key={i}
            points={seg}
            fill="none"
            stroke={colors.star}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {lastPoint ? (
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={colors.star} />
        ) : null}
      </Svg>
    </Pressable>
  );
}
