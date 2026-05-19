import { useEffect, useMemo, useState } from "react";

import { ScrollView, Text, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { FoodItemNutritionCard } from "@/components/FoodItemNutritionCard";

import { MealNutritionSummary } from "@/components/MealNutritionSummary";

import { Screen, Button, BackHeader, toastError, toastSuccess } from "@/components/ui";

import type { MealItem } from "@/lib/api";

import { saveMeal } from "@/lib/api";

import { normalizeMealItem, sumMealItems } from "@/lib/mealNutrition";

import { colors } from "@/theme/colors";



export default function ScanResultScreen() {

  const router = useRouter();

  const { items: itemsParam, photoUri } = useLocalSearchParams<{ items: string; photoUri?: string }>();

  const [items, setItems] = useState<MealItem[]>(() => {

    try {

      const parsed = JSON.parse(itemsParam || "[]") as Partial<MealItem>[];

      return Array.isArray(parsed) ? parsed.map((it) => normalizeMealItem(it)) : [];

    } catch {

      return [];

    }

  });

  const [loading, setLoading] = useState(false);

  const [emptyNotified, setEmptyNotified] = useState(false);



  const totals = useMemo(() => sumMealItems(items), [items]);

  const avgConfidence = useMemo(() => {
    const scored = items.filter((it) => it.confidence != null) as { confidence: number }[];
    if (!scored.length) return null;
    return scored.reduce((sum, it) => sum + it.confidence, 0) / scored.length;
  }, [items]);

  const lowMealConfidence = avgConfidence != null && avgConfidence < 0.7;



  useEffect(() => {

    if (!items.length && !emptyNotified) {

      toastError("No food detected. Try another photo or angle.");

      setEmptyNotified(true);

    }

  }, [items.length, emptyNotified]);



  const updateItem = (idx: number, field: keyof MealItem, value: string) => {

    setItems((prev) => {

      const next = [...prev];

      const n = { ...next[idx] };

      if (field === "name" || field === "portion") {

        (n as Record<string, unknown>)[field] = value;

      } else if (field === "calories" || field === "sodium_mg") {

        (n as Record<string, unknown>)[field] = parseInt(value, 10) || 0;

      } else {

        (n as Record<string, unknown>)[field] = parseFloat(value) || 0;

      }

      next[idx] = normalizeMealItem(n);

      return next;

    });

  };



  const save = async () => {

    if (!items.length) {

      toastError("Add at least one food item to save.");

      return;

    }

    setLoading(true);

    try {

      const payload = items.map((it) => normalizeMealItem(it));

      await saveMeal(photoUri ?? null, payload);

      toastSuccess("Meal saved.");

      router.replace("/(tabs)");

    } catch (e) {

      console.error(e);

      toastError((e as Error).message);

    } finally {

      setLoading(false);

    }

  };



  return (

    <Screen>

      <BackHeader title="Your meal" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>

        {items.length > 0 ? (

          <>

            <MealNutritionSummary totals={totals} title="Meal total" />

            {lowMealConfidence ? (
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.warning,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: colors.warning, fontSize: 13, fontWeight: "600" }}>
                  Lower confidence estimate
                  {avgConfidence != null ? ` (${Math.round(avgConfidence * 100)}% avg)` : ""}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, lineHeight: 18 }}>
                  Review portions and macros before saving.
                </Text>
              </View>
            ) : null}

            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, lineHeight: 18 }}>
              Estimates — verify packaged foods on the label.
            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>

              {items.length} item{items.length === 1 ? "" : "s"} — tap numbers to fix anything off

            </Text>

            {items.map((it, i) => (

              <FoodItemNutritionCard key={i} item={it} index={i} editable onChange={(field, value) => updateItem(i, field, value)} />

            ))}

          </>

        ) : (

          <View style={{ marginTop: 24, paddingHorizontal: 8 }}>

            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600", textAlign: "center" }}>

              Nothing recognized

            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: 12, textAlign: "center", lineHeight: 22 }}>

              Try a clearer photo with the food centered and good lighting.

            </Text>

          </View>

        )}

      </ScrollView>

      <Button label="Save meal" onPress={save} loading={loading} disabled={!items.length} />

    </Screen>

  );

}

