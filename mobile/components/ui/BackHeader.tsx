import { Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/components/icons";
import { colors } from "@/theme/colors";

type Props = {
  title?: string;
};

export function BackHeader({ title }: Props) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", minHeight: 44, marginBottom: 8 }}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          padding: 4,
          marginLeft: -4,
          ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
        })}
      >
        <ChevronLeft color={colors.textPrimary} size={28} />
      </Pressable>
      {title ? (
        <Text
          style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600", marginLeft: 4, flex: 1 }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}
