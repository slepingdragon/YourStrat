import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Button, BackHeader, toastSuccess } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function SessionSummaryScreen() {
  const { burned, duration, id } = useLocalSearchParams<{ burned?: string; duration?: string; id?: string }>();
  const router = useRouter();
  const cal = parseInt(burned ?? "0", 10);
  const sec = parseInt(duration ?? "0", 10);
  const mins = Math.floor(sec / 60);

  return (
    <Screen>
      <BackHeader />
      <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700" }}>Workout logged.</Text>
      <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 18 }}>
        {cal} cal burned. {mins} min.
      </Text>
      <View style={{ flex: 1 }} />
      <Button
        label="Done"
        onPress={() => {
          toastSuccess("Workout logged.");
          router.replace("/(tabs)");
        }}
      />
    </Screen>
  );
}
