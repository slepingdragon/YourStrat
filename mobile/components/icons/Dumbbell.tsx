import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Dumbbell({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M6.5 6.5h11v11h-11z" />
      <Path d="M3 9v6M21 9v6M6.5 3v3M6.5 18v3M17.5 3v3M17.5 18v3" />
    </IconStroke>
  );
}
