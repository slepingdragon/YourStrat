import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, toastError, toastSuccess } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ResetConfirmScreen() {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const update = async () => {
    if (password.length < 6) {
      toastError(t("reset.passwordMin"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      console.error(error);
      toastError(error.message);
      return;
    }
    toastSuccess(t("reset.passwordUpdated"));
    router.replace("/(auth)/login");
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: spacing.xxxl }}>
        {t("reset.newTitle")}
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xxl }}>
        {t("reset.newSub")}
      </Text>
      <Input placeholder={t("reset.newPlaceholder")} secureTextEntry value={password} onChangeText={setPassword} />
      <Button label={t("reset.savePassword")} onPress={update} loading={loading} />
    </Screen>
  );
}
