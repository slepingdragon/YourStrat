import { ReactNode } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { colors } from "@/theme/colors";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
