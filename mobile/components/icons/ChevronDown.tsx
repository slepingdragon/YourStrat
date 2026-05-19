import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function ChevronDown({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M6 9l6 6 6-6" />
    </IconStroke>
  );
}
