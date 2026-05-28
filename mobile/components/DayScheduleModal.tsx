import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, GlassModal } from "@/components/ui";
import { DAY_LABELS, DAY_PRESETS } from "@/lib/scheduleDays";
import { colors } from "@/theme/colors";
import { glass } from "@/theme/glass";
import { spacing } from "@/theme/spacing";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (days: number[]) => void;
  loading?: boolean;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? glass.borderStrong : glass.border,
        backgroundColor: active ? glass.overlayModal : glass.chipFill,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: active ? colors.textPrimary : colors.textSecondary, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export function DayScheduleModal({ visible, onClose, onConfirm, loading }: Props) {
  const [days, setDays] = useState<number[]>([...DAY_PRESETS.weekdays]);

  const toggle = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
  };

  const setPreset = (preset: readonly number[]) => setDays([...preset]);

  const confirm = () => {
    if (!days.length) return;
    onConfirm([...days].sort((a, b) => a - b));
  };

  return (
    <GlassModal visible={visible} onClose={onClose} placement="bottom" panelStyle={{ gap: spacing.md }}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>Which days?</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
        Pick when this routine runs.
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm }}>
        <Chip label="Mon–Fri" active={days.join() === DAY_PRESETS.weekdays.join()} onPress={() => setPreset(DAY_PRESETS.weekdays)} />
        <Chip label="Sat–Sun" active={days.join() === DAY_PRESETS.weekend.join()} onPress={() => setPreset(DAY_PRESETS.weekend)} />
        <Chip label="Every day" active={days.length === 7} onPress={() => setPreset(DAY_PRESETS.every)} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg }}>
        {DAY_LABELS.map((label, i) => (
          <Chip key={label} label={label} active={days.includes(i)} onPress={() => toggle(i)} />
        ))}
      </View>

      <Button label="Save routine" onPress={confirm} loading={loading} disabled={!days.length || loading} />
      <View style={{ marginTop: spacing.sm }}>
        <Button label="Cancel" variant="ghost" onPress={onClose} />
      </View>
    </GlassModal>
  );
}
