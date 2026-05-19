import { Platform, Text, TextInput, TextInputProps, TextStyle, View } from "react-native";
import { useState } from "react";
import { colors } from "@/theme/colors";

type Props = TextInputProps & { centered?: boolean; error?: string | null };

const webInputReset: TextStyle =
  Platform.OS === "web"
    ? ({
        outlineWidth: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
      } as TextStyle)
    : {};

export function Input({ centered = true, style, error, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.error
    : focused
      ? colors.star
      : colors.border;
  return (
    <View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor,
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
          accessibilityLabel={rest.accessibilityLabel ?? (typeof rest.placeholder === "string" ? rest.placeholder : undefined)}
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
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
