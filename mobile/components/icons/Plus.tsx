import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Plus({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M12 5v14M5 12h14" />
    </IconStroke>
  );
}
