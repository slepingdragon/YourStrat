import { ReactNode } from "react";
import { ViewStyle, StyleProp } from "react-native";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { radius, spacing } from "@/theme/spacing";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: Props) {
  return (
    <GlassPanel
      variant="card"
      style={[
        {
          borderRadius: radius.xl,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </GlassPanel>
  );
}
