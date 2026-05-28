import { Platform, Text, TextInput, TextInputProps, TextStyle, View } from "react-native";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
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
      <GlassPanel
        variant="input"
        intensity={32}
        style={{
          borderWidth: 2,
          borderColor,
          borderRadius: 12,
          minHeight: 56,
          justifyContent: "center",
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
      </GlassPanel>
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
