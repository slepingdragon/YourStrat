import { Image, Linking, Pressable, Text, View } from "react-native";
import { faviconUrl, type NutritionSourceLink } from "@/lib/nutritionSources";
import { colors } from "@/theme/colors";

type Props = {
  source: NutritionSourceLink;
};

export function SourceLinkRow({ source }: Props) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(source.url)}
      accessibilityRole="link"
      accessibilityLabel={`${source.title}, opens in browser`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: faviconUrl(source.domain) }}
          style={{ width: 18, height: 18 }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
          {source.domain}
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: 14, lineHeight: 20, marginTop: 2 }} numberOfLines={2}>
          {source.title}
        </Text>
      </View>
    </Pressable>
  );
}
