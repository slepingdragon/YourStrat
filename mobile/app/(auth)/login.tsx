import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Screen, Button, Input, LinkButton, toastError } from "@/components/ui";
import { Star, Edit } from "@/components/icons";
import { signInWithGoogle, supabase } from "@/lib/supabase";
import { LANGUAGES, translate, useI18n, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

function signInErrorMessage(message: string): string {
  if (/email not confirmed/i.test(message)) return translate("auth.emailNotConfirmed");
  if (/invalid login credentials/i.test(message)) return translate("auth.invalidCredentials");
  return message;
}

export default function LoginScreen() {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const setLang = useI18n((s) => s.setLang);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
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
        <Star size={48} />
        <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", marginTop: 16 }}>
          {t("auth.tagline")}
        </Text>
        <Pressable
          onPress={() => setLang(lang === "en" ? "id" : "en")}
          accessibilityRole="button"
          accessibilityLabel={t("auth.changeLanguage")}
          hitSlop={8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Edit size={16} color={colors.textSecondary} />
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>{current.native}</Text>
        </Pressable>
      </View>
      <Input placeholder={t("auth.email")} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <Input placeholder={t("auth.password")} secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 24 }} />
      <Button label={t("auth.signIn")} onPress={signIn} loading={loading} />
      <View style={{ height: 12 }} />
      <Button label={t("auth.continueGoogle")} onPress={onGoogle} loading={googleLoading} variant="secondary" />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/signup" label={t("auth.createAccount")} />
      <LinkButton href="/(auth)/reset" label={t("auth.resetPassword")} tone="muted" />
    </Screen>
  );
}
