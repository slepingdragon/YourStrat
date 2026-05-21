import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";

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

  return (
    <View style={{ alignItems: "center", width: size + 8, minHeight: hideLabel ? size : size + 36 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          <Circle cx={cx} cy={cx} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
          {inLen > 0 ? (
            <Circle
              cx={cx}
              cy={cx}
              r={r}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${inLen} ${circ - inLen}`}
              strokeDashoffset={0}
              rotation={-90}
              origin={`${cx}, ${cx}`}
            />
          ) : null}
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
        <Text style={{ color: overColor, fontSize: 10, fontWeight: "600", marginTop: 2 }}>Over limit</Text>
      ) : null}
    </View>
  );
}
