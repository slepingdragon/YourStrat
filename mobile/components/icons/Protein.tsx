import { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconStroke } from "./IconStroke";

export function Protein({ size }: { size?: number }) {
  return (
    <IconStroke color={colors.protein} size={size}>
      <Path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
    </IconStroke>
  );
}
