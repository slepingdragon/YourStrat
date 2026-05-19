import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function ChevronLeft({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M15 18l-6-6 6-6" />
    </IconStroke>
  );
}
