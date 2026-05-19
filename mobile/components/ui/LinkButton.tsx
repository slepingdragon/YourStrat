import { Pressable, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { colors } from "@/theme/colors";

type Tone = "primary" | "muted";

type Props = {
  href: Href;
  label: string;
  tone?: Tone;
};

export function LinkButton({ href, label, tone = "primary" }: Props) {
  const router = useRouter();
  const color = tone === "muted" ? colors.textMuted : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ color, fontSize: 15, fontWeight: "600", textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}
