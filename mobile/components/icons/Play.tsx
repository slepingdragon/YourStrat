import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Play({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M5 3l14 9-14 9V3z" />
    </IconStroke>
  );
}
