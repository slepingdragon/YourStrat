import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function X({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M18 6L6 18M6 6l12 12" />
    </IconStroke>
  );
}
