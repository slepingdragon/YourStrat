import { memo } from "react";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  name: string;
  sets?: number | null;
  reps?: number | null;
  durationSec?: number | null;
  drag?: boolean;
};

function ExerciseRowImpl({ name, sets, reps, durationSec, drag }: Props) {
  const detail =
    durationSec != null
      ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}`
      : sets != null && reps != null
        ? `${sets} x ${reps}`
        : "";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {drag ? (
        <Text style={{ color: colors.textMuted, marginRight: 12, fontSize: 18 }}>≡</Text>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{name}</Text>
        {detail ? <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{detail}</Text> : null}
      </View>
    </View>
  );
}

export const ExerciseRow = memo(ExerciseRowImpl);
