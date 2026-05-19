import type { ReactNode } from "react";
import Svg from "react-native-svg";
import { colors } from "@/theme/colors";

type Props = { children: ReactNode; color?: string; size?: number };

export function IconStroke({ children, color = colors.textPrimary, size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}
