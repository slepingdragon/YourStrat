import { View, useWindowDimensions } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const DOT_GRID_STEP = spacing.lg + spacing.xs;
const DOT_RADIUS = 0.72;
const DOT_OPACITY = 0.12;
const EDGE_BLEED = 1;

export function BloomBackground() {
  const { width, height } = useWindowDimensions();
  const svgWidth = Math.ceil(width) + EDGE_BLEED * 2;
  const svgHeight = Math.ceil(height) + EDGE_BLEED * 2;
  const reach = Math.max(svgWidth, svgHeight);

  // Center the dot grid so the leftover space is split evenly on both axes —
  // otherwise the rightmost dot column hugs the right edge.
  const dotOffsetX = ((svgWidth % DOT_GRID_STEP) / 2) - DOT_GRID_STEP / 2;
  const dotOffsetY = ((svgHeight % DOT_GRID_STEP) / 2) - DOT_GRID_STEP / 2;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: -EDGE_BLEED, left: -EDGE_BLEED, right: -EDGE_BLEED, bottom: -EDGE_BLEED }}
    >
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <Pattern
            id="xaeryxDotGrid"
            x={dotOffsetX}
            y={dotOffsetY}
            width={DOT_GRID_STEP}
            height={DOT_GRID_STEP}
            patternUnits="userSpaceOnUse"
          >
            <Circle cx={DOT_GRID_STEP / 2} cy={DOT_GRID_STEP / 2} r={DOT_RADIUS} fill={colors.star} opacity={DOT_OPACITY} />
          </Pattern>

          <LinearGradient id="xaeryxTopLift" x1="0" y1="0" x2="0" y2={svgHeight}>
            <Stop offset="0" stopColor={colors.star} stopOpacity={0.03} />
            <Stop offset="0.45" stopColor={colors.star} stopOpacity={0} />
          </LinearGradient>

          <RadialGradient
            id="xaeryxMainBloom"
            cx={svgWidth * 0.5}
            cy={svgHeight * 0.16}
            r={reach * 0.82}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.starDim} stopOpacity={0.11} />
            <Stop offset="0.5" stopColor={colors.starDim} stopOpacity={0.045} />
            <Stop offset="1" stopColor={colors.starDim} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            id="xaeryxSparkBloom"
            cx={svgWidth * 0.82}
            cy={svgHeight * 0.09}
            r={reach * 0.56}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.spark} stopOpacity={0.04} />
            <Stop offset="0.55" stopColor={colors.spark} stopOpacity={0.012} />
            <Stop offset="1" stopColor={colors.spark} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            id="xaeryxCoreBloom"
            cx={svgWidth * 0.5}
            cy={svgHeight * 0.48}
            r={reach * 0.36}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.star} stopOpacity={0.025} />
            <Stop offset="1" stopColor={colors.star} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            id="xaeryxVignette"
            cx={svgWidth * 0.5}
            cy={svgHeight * 0.36}
            r={reach * 0.95}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="0.68" stopColor={colors.bg} stopOpacity={0.3} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={0.86} />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill={colors.bg} />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxDotGrid)" />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxTopLift)" />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxMainBloom)" />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxSparkBloom)" />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxCoreBloom)" />
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#xaeryxVignette)" />
      </Svg>
    </View>
  );
}
