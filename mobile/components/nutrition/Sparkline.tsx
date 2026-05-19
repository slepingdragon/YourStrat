import { memo } from "react";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { colors } from "@/theme/colors";

type Props = {
  values: number[];
  target: number;
  color: string;
  width?: number;
  height?: number;
};

function SparklineImpl({ values, target, color, width = 88, height = 28 }: Props) {
  const w = width;
  const h = height;
  const max = Math.max(target, ...values, 1);
  const targetY = target > 0 ? h - (target / max) * h : null;

  if (values.length < 2) {
    const last = values[values.length - 1] ?? 0;
    const cx = w;
    const cy = max > 0 ? h - (last / max) * h : h;
    return (
      <Svg width={w} height={h}>
        {targetY != null ? (
          <Line x1={0} y1={targetY} x2={w} y2={targetY} stroke={colors.border} strokeWidth={1} strokeDasharray="2,3" />
        ) : null}
        <Circle cx={cx} cy={cy} r={2.5} fill={color} />
      </Svg>
    );
  }

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = max > 0 ? h - (v / max) * h : h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={w} height={h}>
      {targetY != null ? (
        <Line x1={0} y1={targetY} x2={w} y2={targetY} stroke={colors.border} strokeWidth={1} strokeDasharray="2,3" />
      ) : null}
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const Sparkline = memo(SparklineImpl);
