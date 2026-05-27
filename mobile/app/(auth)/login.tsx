import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Screen, Button, Input, LinkButton, toastError } from "@/components/ui";
import { Star, Edit, Check } from "@/components/icons";
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
  const [langOpen, setLangOpen] = useState(false);
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
          onPress={() => setLangOpen(true)}
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

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable
          onPress={() => setLangOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360, backgroundColor: colors.surfaceElevated, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: spacing.sm }}>
              {t("profile.language")}
            </Text>
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: radius.lg,
                    backgroundColor: active ? colors.surface : "transparent",
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: active ? "700" : "500" }}>{l.native}</Text>
                  {active ? <Check size={20} color={colors.star} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
