import { Path } from "react-native-svg";
import { IconStroke } from "./IconStroke";

export function Camera({ color, size }: { color?: string; size?: number }) {
  return (
    <IconStroke color={color} size={size}>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <Path d="M12 17a5 5 0 100-10 5 5 0 000 10z" />
    </IconStroke>
  );
}
