import { useState } from "react";
import { Text, View } from "react-native";
import { Screen, Button, Input, LinkButton, toastError, toastSuccess } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ResetScreen() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError(t("reset.enterEmail"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: "yourstrat://reset-confirm",
    });
    setLoading(false);
    if (error) {
      console.error(error);
      toastError(error.message);
      return;
    }
    toastSuccess(t("reset.checkEmail"));
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: spacing.xxxl }}>
        {t("reset.title")}
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xxl }}>
        {t("reset.sub")}
      </Text>
      <Input placeholder={t("reset.emailPlaceholder")} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 24 }} />
      <Button label={t("reset.sendLink")} onPress={send} loading={loading} compact />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/login" label={t("reset.backToSignIn")} />
    </Screen>
  );
}
