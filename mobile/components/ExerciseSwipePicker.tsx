import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button, Input } from "@/components/ui";
import type { CatalogExercise, MuscleFilter } from "@/lib/exerciseCatalog";
import {
  EXERCISE_CATALOG,
  matchesMuscleFilter,
  MUSCLE_FILTER_OPTIONS,
  MUSCLE_LABELS,
} from "@/lib/exerciseCatalog";
import { estimateExerciseCalories, formatDefaultVolume } from "@/lib/exerciseCalories";
import { formatKcal } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const SWIPE_THRESHOLD = 80;
const DEFAULT_WEIGHT_KG = 70;

type LastAction = { type: "add" | "skip"; slug: string };

type Props = {
  selectedSlugs: Set<string>;
  selectedCount: number;
  onAdd: (exercise: CatalogExercise) => void;
  onSkip: (exercise: CatalogExercise) => void;
  onRemove?: (slug: string) => void;
};

export function ExerciseSwipePicker({ selectedSlugs, selectedCount, onAdd, onSkip, onRemove }: Props) {
  const t = useT();
  const profile = useStore((s) => s.profile);
  const weightKg = profile?.weight_kg ?? DEFAULT_WEIGHT_KG;

  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>("all");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const hintShownRef = useRef(false);

  const deck = useMemo(() => {
    let list = [...EXERCISE_CATALOG];
    if (muscleFilter !== "all") {
      list = list.filter((e) => matchesMuscleFilter(e.muscle, muscleFilter));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [muscleFilter, search]);

  const safeIndex = deck.length ? Math.min(index, deck.length - 1) : 0;
  const current = deck[safeIndex] ?? null;
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (hintShownRef.current || !current) return;
    hintShownRef.current = true;
    translateX.value = withDelay(
      400,
      withSequence(
        withTiming(40, { duration: 280 }),
        withTiming(-20, { duration: 220 }),
        withSpring(0)
      )
    );
  }, [current, translateX]);

  const advance = (action: "add" | "skip", exercise: CatalogExercise) => {
    if (action === "add" && !selectedSlugs.has(exercise.slug)) onAdd(exercise);
    else if (action === "skip") onSkip(exercise);
    setLastAction({ type: action, slug: exercise.slug });
    setIndex((i) => Math.min(i + 1, Math.max(deck.length - 1, 0)));
    translateX.value = 0;
  };

  const undo = () => {
    if (!lastAction) return;
    if (lastAction.type === "add" && onRemove) onRemove(lastAction.slug);
    setIndex((i) => Math.max(i - 1, 0));
    setLastAction(null);
    translateX.value = 0;
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (!current) return;
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(400, {}, () => runOnJS(advance)("add", current));
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-400, {}, () => runOnJS(advance)("skip", current));
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${translateX.value / 30}deg` }],
  }));

  const calories = current ? estimateExerciseCalories(current, weightKg) : 0;
  const alreadyAdded = current ? selectedSlugs.has(current.slug) : false;

  const selectFilter = (id: MuscleFilter) => {
    setMuscleFilter(id);
    setIndex(0);
  };

  return (
    <View style={{ flex: 1, marginTop: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 }}>
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.star, fontWeight: "600", fontSize: 11 }}>
            {t("routine.picked", { n: selectedCount })}
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          minHeight: 280,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: Platform.OS === "web" ? 440 : undefined,
          alignSelf: "center",
        }}
      >
        {current ? (
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                {
                  width: "100%",
                  flex: 1,
                  minHeight: 280,
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 28,
                  justifyContent: "center",
                },
                cardStyle,
              ]}
            >
              <Text style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                {MUSCLE_LABELS[current.muscle]} · {current.type}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "800", marginTop: 10, lineHeight: 34 }}>
                {current.name}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 14, fontSize: 15, lineHeight: 22 }}>
                {current.description}
              </Text>
              <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                  ~{formatKcal(calories)} cal
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                  {t("routine.estForWeight", { volume: formatDefaultVolume(current) })}
                </Text>
              </View>
              {alreadyAdded ? (
                <Text style={{ color: colors.star, marginTop: spacing.lg, fontWeight: "600" }}>{t("routine.alreadyInRoutine")}</Text>
              ) : null}
            </Animated.View>
          </GestureDetector>
        ) : (
          <Text style={{ color: colors.textMuted, textAlign: "center", paddingHorizontal: spacing.xl, lineHeight: 22 }}>
            {deck.length === 0
              ? t("routine.noMatchFilter")
              : t("routine.noMoreFilter")}
          </Text>
        )}
      </View>

      {current ? (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12, paddingBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Button label={t("routine.skip")} variant="secondary" onPress={() => advance("skip", current)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={alreadyAdded ? t("routine.added") : t("routine.add")}
              onPress={() => advance("add", current)}
              disabled={alreadyAdded}
            />
          </View>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: 8,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t("routine.swipeHint")}
        </Text>
        {lastAction ? (
          <Pressable
            onPress={undo}
            accessibilityRole="button"
            accessibilityLabel={t("routine.undoAction", { action: lastAction.type })}
            hitSlop={8}
          >
            <Text style={{ color: colors.spark, fontSize: 12, fontWeight: "700" }}>{t("routine.undo")}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ marginTop: 12 }}
        contentContainerStyle={{ gap: 8, paddingRight: 4, alignItems: "center" }}
      >
        {MUSCLE_FILTER_OPTIONS.map((opt) => {
          const active = muscleFilter === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => selectFilter(opt.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t("routine.filterA11y", { label: opt.label })}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.star : colors.border,
                backgroundColor: active ? colors.star : colors.surface,
              }}
            >
              <Text
                style={{
                  color: active ? colors.bg : colors.textPrimary,
                  fontWeight: active ? "700" : "500",
                  fontSize: 12,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ marginTop: 8 }}>
        <Input
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setIndex(0);
          }}
          placeholder={t("routine.searchExercises")}
          centered={false}
          style={{ fontSize: 15, paddingVertical: Platform.OS === "web" ? 10 : 8 }}
        />
      </View>
    </View>
  );
}
