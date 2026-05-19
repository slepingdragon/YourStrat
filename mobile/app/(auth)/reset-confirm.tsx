import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, toastError, toastSuccess } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function ResetConfirmScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const update = async () => {
    if (password.length < 6) {
      toastError("Password must be at least 6 characters.");
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
    toastSuccess("Password updated.");
    router.replace("/(auth)/login");
  };

  return (
    <Screen scroll>
      <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center", marginTop: 48 }}>
        New password
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 32 }}>
        Enter your new password.
      </Text>
      <Input placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button label="Save password" onPress={update} loading={loading} />
    </Screen>
  );
}
