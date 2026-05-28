import Svg, { Polygon } from "react-native-svg";
import { colors } from "@/theme/colors";

type Props = { size?: number };

/**
 * The YourStrat mark: a real five-point star, faceted into a lit and a shadowed
 * half per point (a crystalline pinwheel) so it catches light and feels like a
 * gem rather than a flat glyph. Self-colored from the theme star tokens; the tab
 * bar dims it via opacity when inactive. Geometry on a centered -50..50 grid:
 * outer radius 48, inner radius 19, each ridge running from center to a tip.
 */
const LIT = colors.star;
const SHADE = colors.starDim;

export function Star({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="-50 -50 100 100">
      {/* Point 1 (top) */}
      <Polygon points="0,0 -11.17,-15.37 0,-48" fill={SHADE} />
      <Polygon points="0,0 0,-48 11.17,-15.37" fill={LIT} />
      {/* Point 2 (upper right) */}
      <Polygon points="0,0 11.17,-15.37 45.63,-14.83" fill={SHADE} />
      <Polygon points="0,0 45.63,-14.83 18.07,5.87" fill={LIT} />
      {/* Point 3 (lower right) */}
      <Polygon points="0,0 18.07,5.87 28.18,38.78" fill={SHADE} />
      <Polygon points="0,0 28.18,38.78 0,19" fill={LIT} />
      {/* Point 4 (lower left) */}
      <Polygon points="0,0 0,19 -28.18,38.78" fill={SHADE} />
      <Polygon points="0,0 -28.18,38.78 -18.07,5.87" fill={LIT} />
      {/* Point 5 (upper left) */}
      <Polygon points="0,0 -18.07,5.87 -45.63,-14.83" fill={SHADE} />
      <Polygon points="0,0 -45.63,-14.83 -11.17,-15.37" fill={LIT} />
    </Svg>
  );
}
