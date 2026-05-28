import { useState } from "react";
import { Image, View } from "react-native";
import { Screen, Button, Input, LanguagePicker, LinkButton, toastError } from "@/components/ui";
import { signInWithGoogle, supabase } from "@/lib/supabase";
import { translate, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { spacing } from "@/theme/spacing";

function signInErrorMessage(message: string): string {
  if (/email not confirmed/i.test(message)) return translate("auth.emailNotConfirmed");
  if (/invalid login credentials/i.test(message)) return translate("auth.invalidCredentials");
  return message;
}

export default function LoginScreen() {
  const t = useT();
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

  const signIn = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError(t("auth.enterEmail"));
      return;
    }
    if (!password) {
      toastError(t("auth.enterPassword"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (error) {
        console.error(error);
        toastError(signInErrorMessage(error.message));
        return;
      }
      if (data.session) {
        useStore.getState().setSession(data.session);
      }
    } catch (e) {
      console.error(e);
      toastError((e as Error).message ?? t("auth.signInFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ alignItems: "center", marginTop: 48, marginBottom: 32 }}>
        <Image
          source={require("../../assets/logo/xaeryx-star.png")}
          style={{ width: 84, height: 84 }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Xaeryx"
        />
        <View style={{ marginTop: spacing.lg }}>
          <LanguagePicker variant="chip" />
        </View>
      </View>
      <Input placeholder={t("auth.email")} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <Input placeholder={t("auth.password")} secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 24 }} />
      <Button label={t("auth.signIn")} onPress={signIn} loading={loading} />
      <View style={{ height: 12 }} />
      <Button label={t("auth.continueGoogle")} onPress={onGoogle} loading={googleLoading} variant="secondary" />
      <View style={{ height: 24 }} />
      <LinkButton href="/(auth)/signup" label={t("auth.createAccount")} tone="accent" />
      <View style={{ height: 24 }} />
      <LinkButton href="/(auth)/reset" label={t("auth.resetPassword")} tone="muted" />

    </Screen>
  );
}
