import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Pause({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </IconStroke>
  );
}
