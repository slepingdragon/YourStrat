import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Check({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M20 6L9 17l-5-5" />
    </IconStroke>
  );
}
