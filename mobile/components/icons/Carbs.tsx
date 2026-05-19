import { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconStroke } from "./IconStroke";

export function Carbs({ size }: { size?: number }) {
  return (
    <IconStroke color={colors.carbs} size={size}>
      <Path d="M4 14h16M4 10h16M4 18h10" />
    </IconStroke>
  );
}
