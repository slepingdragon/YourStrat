import { useState } from "react";
import { Text, View } from "react-native";
import { Screen, Button, Input, LinkButton, toastError } from "@/components/ui";
import { Star } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

function signInErrorMessage(message: string): string {
  if (/email not confirmed/i.test(message)) {
    return "Confirm your email from the signup link, then sign in again.";
  }
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect.";
  }
  return message;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError("Enter your email.");
      return;
    }
    if (!password) {
      toastError("Enter your password.");
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
      toastError((e as Error).message ?? "Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ alignItems: "center", marginTop: 48, marginBottom: 32 }}>
        <Star size={48} />
        <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", marginTop: 16 }}>
          Find your North.
        </Text>
      </View>
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 24 }} />
      <Button label="Sign in" onPress={signIn} loading={loading} />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/signup" label="Create account" />
      <LinkButton href="/(auth)/reset" label="Reset password" tone="muted" />
    </Screen>
  );
}
