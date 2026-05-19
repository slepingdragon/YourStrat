import { Image, Pressable, Text, View } from "react-native";
import type { Meal } from "@/lib/api";
import { Card } from "@/components/ui";
import { colors } from "@/theme/colors";

type Props = { meal: Meal; onPress: () => void };

export function MealCard({ meal, onPress }: Props) {
  const top = meal.items?.slice(0, 2).map((i) => i.name).join(", ") || "Meal";
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: 12, flexDirection: "row", gap: 12 }}>
        {meal.photo_url ? (
          <Image source={{ uri: meal.photo_url }} style={{ width: 56, height: 56, borderRadius: 8 }} />
        ) : (
          <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surfaceElevated }} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }} numberOfLines={1}>
            {top}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            {meal.total_calories} cal · P {Math.round(meal.total_protein_g)}g
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
