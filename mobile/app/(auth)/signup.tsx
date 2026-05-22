import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, LinkButton, toastError, toastSuccess } from "@/components/ui";
import { signInWithGoogle, supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function SignupScreen() {
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
      toastError((e as Error).message ?? "Google sign in failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const signUp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError("Enter your email.");
      return;
    }
    if (password.length < 6) {
      toastError("Password must be at least 6 characters.");
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
      toastSuccess("Check your email to confirm your account, then sign in.");
      router.replace("/(auth)/login");
      return;
    }
    toastSuccess("Account created. Complete your profile.");
    router.replace("/(auth)/onboarding");
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: 48 }}>
        Create account
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 32 }}>
        Email and password only.
      </Text>
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 24 }} />
      <Button label="Sign up" onPress={signUp} loading={loading} />
      <View style={{ height: 12 }} />
      <Button label="Continue with Google" onPress={onGoogle} loading={googleLoading} variant="secondary" />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/login" label="Already have an account" />
    </Screen>
  );
}
