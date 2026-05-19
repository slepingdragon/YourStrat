import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Trash({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    </IconStroke>
  );
}
