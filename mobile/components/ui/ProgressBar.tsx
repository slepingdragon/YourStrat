import { View } from "react-native";
import { colors } from "@/theme/colors";

type Props = { progress: number };

export function ProgressBar({ progress }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: 24 }}>
      <View style={{ height: 4, width: `${p * 100}%`, backgroundColor: colors.star, borderRadius: 2 }} />
    </View>
  );
}
