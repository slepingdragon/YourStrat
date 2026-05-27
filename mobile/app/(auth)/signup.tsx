import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, LinkButton, toastError, toastSuccess } from "@/components/ui";
import { signInWithGoogle, supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

export default function SignupScreen() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      toastError((e as Error).message ?? t("auth.googleFailed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const signUp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError(t("auth.enterEmail"));
      return;
    }
    if (password.length < 6) {
      toastError(t("auth.passwordMin"));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: trimmed, password });
    setLoading(false);
    if (error) {
      console.error(error);
      toastError(error.message);
      return;
    }
    if (!data.session) {
      toastSuccess(t("auth.checkEmailConfirm"));
      router.replace("/(auth)/login");
      return;
    }
    toastSuccess(t("auth.accountCreated"));
    router.replace("/(auth)/onboarding");
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: 48 }}>
        {t("auth.createAccount")}
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 32 }}>
        {t("auth.emailPasswordOnly")}
      </Text>
      <Input placeholder={t("auth.email")} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <Input placeholder={t("auth.password")} secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 24 }} />
      <Button label={t("auth.signUp")} onPress={signUp} loading={loading} />
      <View style={{ height: 12 }} />
      <Button label={t("auth.continueGoogle")} onPress={onGoogle} loading={googleLoading} variant="secondary" />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/login" label={t("auth.alreadyHaveAccount")} />
    </Screen>
  );
}
