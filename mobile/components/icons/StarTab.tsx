import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

// Clean 5-point line star for the Today tab — matches the rest of the tab icon
// set (stroke, color-tinted). Distinct from the multi-tone brand `Star` glyph
// (which stays on the login/profile brand marks).
export function StarTab({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" />
    </IconStroke>
  );
}
