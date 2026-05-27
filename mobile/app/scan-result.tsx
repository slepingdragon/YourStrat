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

import { spacing } from "@/theme/spacing";

import { useScanQueue } from "@/lib/scanQueueStore";

import { DiscardMealDialog } from "@/components/scan/DiscardMealDialog";



export default function ScanResultScreen() {

  const router = useRouter();

  // Opened either from the scan queue (queueId -> read items from the store) or
  // directly from a barcode match (items passed as a JSON param).
  const { items: itemsParam, queueId } = useLocalSearchParams<{ items?: string; queueId?: string }>();

  const queuedItems = useScanQueue((s) => (queueId ? s.queue.find((q) => q.id === queueId)?.items : undefined));

  const removeFromQueue = useScanQueue((s) => s.remove);

  const [items, setItems] = useState<MealItem[]>(() => {

    try {

      const raw: Partial<MealItem>[] = queueId
        ? (queuedItems ?? [])
        : (JSON.parse(itemsParam || "[]") as Partial<MealItem>[]);

      return Array.isArray(raw) ? raw.map((it) => normalizeMealItem(it)) : [];

    } catch {

      return [];

    }

  });

  const [confirmDiscard, setConfirmDiscard] = useState(false);

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



  const removeItem = (idx: number) => {

    setItems((prev) => prev.filter((_, i) => i !== idx));

  };



  const updateItem = (idx: number, field: keyof MealItem, value: string) => {

    setItems((prev) => {

      const next = [...prev];

      const n = { ...next[idx] };

      if (field === "name" || field === "portion") {

        (n as Record<string, unknown>)[field] = value;

      } else if (field === "calories" || field === "sodium_mg") {

        const parsed = parseInt(value, 10);
        (n as Record<string, unknown>)[field] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

      } else {

        const parsed = parseFloat(value);
        (n as Record<string, unknown>)[field] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

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

      // Meal photos aren't uploaded to storage yet, so a local device path isn't
      // a signable object — save without a photo until real upload is wired.
      await saveMeal(null, payload);

      toastSuccess("Meal saved.");

      if (queueId) {
        // Saved from the queue: drop this tab and return to the camera with the
        // rest of the pile intact, so the user keeps clearing scans.
        removeFromQueue(queueId);
        router.back();
      } else {
        router.replace("/(tabs)");
      }

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

              <FoodItemNutritionCard key={i} item={it} index={i} editable onChange={(field, value) => updateItem(i, field, value)} onDelete={() => removeItem(i)} />

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

      <View style={{ gap: spacing.sm }}>

        <Button label="Save meal" onPress={save} loading={loading} disabled={!items.length} />

        <Button label="Discard meal" variant="destructive" onPress={() => setConfirmDiscard(true)} disabled={loading} />

      </View>

      <DiscardMealDialog
        visible={confirmDiscard}
        label={items[0]?.name}
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          if (queueId) removeFromQueue(queueId);
          router.back();
        }}
      />

    </Screen>

  );

}

