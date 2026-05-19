import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function ChevronRight({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M9 18l6-6-6-6" />
    </IconStroke>
  );
}
