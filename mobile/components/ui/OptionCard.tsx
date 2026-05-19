import { Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

type Props = { label: string; selected: boolean; onPress: () => void };

export function OptionCard({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.star : "rgba(255,255,255,0.2)",
        borderRadius: 999,
        minHeight: 56,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
