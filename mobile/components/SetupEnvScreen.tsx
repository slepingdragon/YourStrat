import { Text, View } from "react-native";
import { Screen } from "@/components/ui";
import { colors } from "@/theme/colors";

export function SetupEnvScreen() {
  return (
    <Screen scroll>
      <View style={{ flex: 1, justifyContent: "center", gap: 16, paddingVertical: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.textPrimary }}>
          Connect Supabase
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
          YourStrat needs Supabase keys before the app can load. Copy{" "}
          <Text style={{ color: colors.spark }}>mobile/.env.example</Text> to{" "}
          <Text style={{ color: colors.spark }}>mobile/.env</Text> and fill in:
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 13, color: colors.textMuted }}>
            EXPO_PUBLIC_SUPABASE_URL
          </Text>
          <Text style={{ fontFamily: "monospace", fontSize: 13, color: colors.textMuted }}>
            EXPO_PUBLIC_SUPABASE_ANON_KEY
          </Text>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textMuted }}>
          Find both in your Supabase project → Settings → API. After saving{" "}
          <Text style={{ color: colors.textSecondary }}>mobile/.env</Text>, stop Expo and run{" "}
          <Text style={{ color: colors.textSecondary }}>YourStrat: Mobile Preview</Text> again.
        </Text>
      </View>
    </Screen>
  );
}
