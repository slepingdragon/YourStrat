import { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconStroke } from "./IconStroke";

export function Fat({ size }: { size?: number }) {
  return (
    <IconStroke color={colors.fat} size={size}>
      <Path d="M12 3c-4 6-8 8-8 12a8 8 0 1016 0c0-4-4-6-8-12z" />
    </IconStroke>
  );
}
