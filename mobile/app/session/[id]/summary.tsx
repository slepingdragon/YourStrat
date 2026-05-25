import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RpePicker, rpeLabel } from "@/components/RpePicker";
import { Screen, Button, BackHeader, toastError, toastSuccess } from "@/components/ui";
import { rateSession } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function SessionSummaryScreen() {
  const { burned, duration, id } = useLocalSearchParams<{ burned?: string; duration?: string; id?: string }>();
  const router = useRouter();
  const cal = parseInt(burned ?? "0", 10);
  const sec = parseInt(duration ?? "0", 10);
  const mins = Math.floor(sec / 60);

  const [actualRpe, setActualRpe] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (rpe: number | null) => {
    if (rpe == null || !id) {
      router.replace("/(tabs)");
      return;
    }
    setSaving(true);
    try {
      await rateSession(id, rpe);
      setSaved(true);
      toastSuccess("Workout logged.");
      router.replace("/(tabs)");
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader />
      <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700" }}>Workout logged.</Text>
      <Text style={{ color: colors.textSecondary, marginTop: spacing.md, fontSize: 18 }}>
        {formatKcal(cal)} cal burned · {mins} min
      </Text>

      <View style={{ marginTop: spacing.xxl }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700" }}>
          How hard did you go?
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 }}>
          Rate the session 1–10 so we can track effort over time.
        </Text>
        <View style={{ marginTop: spacing.lg }}>
          <RpePicker value={actualRpe} onChange={setActualRpe} />
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Button
        label={actualRpe ? `Save · ${actualRpe}/10 · ${rpeLabel(actualRpe)}` : "Save without rating"}
        onPress={() => submit(actualRpe)}
        loading={saving}
        disabled={saved}
      />
    </Screen>
  );
}
