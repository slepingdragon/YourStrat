import { Platform, TextInput, TextInputProps, TextStyle, View } from "react-native";
import { useState } from "react";
import { colors } from "@/theme/colors";

type Props = TextInputProps & { centered?: boolean };

const webInputReset: TextStyle =
  Platform.OS === "web"
    ? ({
        outlineWidth: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
      } as TextStyle)
    : {};

export function Input({ centered = true, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: focused ? colors.star : colors.border,
        borderRadius: 12,
        minHeight: 56,
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <TextInput
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            color: colors.textPrimary,
            fontSize: 17,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === "web" ? 14 : 0,
            textAlign: centered ? "center" : "left",
            width: "100%",
          },
          webInputReset,
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
