import { useState } from "react";
import { Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen, Button, Input, toastError } from "@/components/ui";
import { Star } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
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
    const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
    setLoading(false);
    if (error) {
      console.error(error);
      toastError(error.message);
      return;
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
      <View style={{ height: 16 }} />
      <Link href="/(auth)/signup" style={{ color: colors.textSecondary, textAlign: "center" }}>
        Create account
      </Link>
      <Link href="/(auth)/reset" style={{ color: colors.textMuted, textAlign: "center", marginTop: 12 }}>
        Reset password
      </Link>
    </Screen>
  );
}
