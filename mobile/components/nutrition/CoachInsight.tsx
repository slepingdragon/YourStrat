import { memo } from "react";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  message: string | null;
};

function CoachInsightImpl({ message }: Props) {
  if (!message) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <View style={{ width: 3, backgroundColor: colors.spark }} />
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14 }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.6,
            marginBottom: 4,
          }}
        >
          COACH
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: 14, lineHeight: 20 }}>{message}</Text>
      </View>
    </View>
  );
}

export const CoachInsight = memo(CoachInsightImpl);
