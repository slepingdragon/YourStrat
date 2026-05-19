import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Timer({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M12 8v4l3 3M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </IconStroke>
  );
}
