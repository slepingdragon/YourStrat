import { useState } from "react";
import { Text, View } from "react-native";
import { Screen, Button, Input, LinkButton, toastError, toastSuccess } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function ResetScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toastError("Enter your email.");
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
    toastSuccess("Check your email for a reset link.");
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: 48 }}>
        Reset password
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 32 }}>
        We will email you a link.
      </Text>
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Button label="Send link" onPress={send} loading={loading} />
      <View style={{ height: 8 }} />
      <LinkButton href="/(auth)/login" label="Back to sign in" />
    </Screen>
  );
}
