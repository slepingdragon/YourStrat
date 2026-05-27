import { useEffect, useMemo, useState } from "react";

import { Alert, Platform, Text, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { FoodItemNutritionCard } from "@/components/FoodItemNutritionCard";

import { MealNutritionSummary } from "@/components/MealNutritionSummary";

import { Screen, Button, BackHeader, toastError, toastSuccess } from "@/components/ui";

import { deleteMeal, deleteMealItem, getMeal, type Meal, type MealItem } from "@/lib/api";

import { totalsFromMeal } from "@/lib/mealNutrition";

import { colors } from "@/theme/colors";



export default function MealDetailScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const router = useRouter();

  const [meal, setMeal] = useState<Meal | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);



  useEffect(() => {

    if (!id) return;

    getMeal(id).then(setMeal).catch((e) => {

      console.error(e);

      toastError((e as Error).message);

    });

  }, [id]);



  const totals = useMemo(() => (meal ? totalsFromMeal(meal) : null), [meal]);



  const remove = async () => {

    if (!id) return;

    setDeleting(true);

    try {

      await deleteMeal(id);

      toastSuccess("Meal removed.");

      router.back();

    } catch (e) {

      console.error(e);

      toastError((e as Error).message);

    } finally {

      setDeleting(false);

    }

  };



  const removeItem = (item: MealItem) => {
    const itemId = item.id;
    if (!itemId || !id || deletingItemId) return;
    const title = `Remove "${item.name}"?`;
    const message = "This item is removed from the meal and your daily totals update.";
    const run = async () => {
      setDeletingItemId(itemId);
      try {
        const res = await deleteMealItem(id, itemId);
        if (res.meal_deleted) {
          toastSuccess("Meal removed.");
          router.back();
          return;
        }
        setMeal(res.meal);
        toastSuccess("Item removed.");
      } catch (e) {
        console.error(e);
        toastError((e as Error).message);
      } finally {
        setDeletingItemId(null);
      }
    };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) void run();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void run() },
    ]);
  };

  if (!meal || !totals) {

    return (

      <Screen>

        <BackHeader title="Meal" />

        <Text style={{ color: colors.textMuted }}>Loading...</Text>

      </Screen>

    );

  }



  const itemCount = meal.items?.length ?? 0;

  const label =

    itemCount > 0

      ? meal.items!.map((i) => i.name).slice(0, 2).join(", ") + (itemCount > 2 ? "…" : "")

      : "Saved meal";



  return (

    <Screen scroll>

      <BackHeader title="Meal" />

      <View style={{ paddingBottom: 24 }}>

        <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600", marginBottom: 16 }} numberOfLines={2}>

          {label}

        </Text>

        <MealNutritionSummary totals={totals} />

        {itemCount > 0 ? (

          <>

            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>

              {itemCount} item{itemCount === 1 ? "" : "s"}

            </Text>

            {meal.items!.map((it, i) => (

              <FoodItemNutritionCard
                key={it.id ?? `${it.name}-${i}`}
                item={it}
                onDelete={() => removeItem(it)}
              />

            ))}

          </>

        ) : null}

        <View style={{ marginTop: 28 }}>

          <Button label="Delete meal" variant="secondary" onPress={remove} loading={deleting} />

        </View>

      </View>

    </Screen>

  );

}

