import { Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { glass } from "@/theme/glass";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Denser fill when shown on top of charts (trend range, etc.). */
  onDialog?: boolean;
};

export function OptionCard({ label, selected, onPress, onDialog }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.star : glass.border,
        borderRadius: 999,
        minHeight: 56,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: onDialog
          ? selected
            ? glass.optionSelected
            : glass.optionIdle
          : selected
            ? "rgba(255,255,255,0.12)"
            : glass.chipFill,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
