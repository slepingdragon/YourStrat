import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DayScheduleModal } from "@/components/DayScheduleModal";
import { ExerciseSwipePicker } from "@/components/ExerciseSwipePicker";
import { Screen, Button, Input, BackHeader, toastError, toastSuccess } from "@/components/ui";
import { createRoutine } from "@/lib/api";
import {
  catalogBySlug,
  ROUTINE_TEMPLATES,
  type CatalogExercise,
} from "@/lib/exerciseCatalog";
import { resolveCatalogToExercises } from "@/lib/resolveExercises";
import { suggestRoutineName } from "@/lib/routineName";
import { colors } from "@/theme/colors";

export default function NewRoutineScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameExpanded, setNameExpanded] = useState(false);
  const [selected, setSelected] = useState<CatalogExercise[]>([]);
  const [picksOpen, setPicksOpen] = useState(false);
  const [dayModal, setDayModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const selectedSlugs = useMemo(() => new Set(selected.map((e) => e.slug)), [selected]);

  const applyTemplate = (templateId: string) => {
    const tpl = ROUTINE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setActiveTemplate(templateId);
    const items = tpl.slugs.map((s) => catalogBySlug(s)).filter((e): e is CatalogExercise => !!e);
    setSelected((prev) => {
      const have = new Set(prev.map((p) => p.slug));
      return [...prev, ...items.filter((i) => !have.has(i.slug))];
    });
  };

  const addExercise = (exercise: CatalogExercise) => {
    if (selectedSlugs.has(exercise.slug)) return;
    setSelected((s) => [...s, exercise]);
  };

  const removeExercise = (slug: string) => {
    setSelected((s) => s.filter((e) => e.slug !== slug));
  };

  const openSave = () => {
    setDayModal(true);
  };

  const saveWithDays = async (scheduledDays: number[]) => {
    setLoading(true);
    try {
      const exercises = await resolveCatalogToExercises(selected);
      const templateName = activeTemplate
        ? ROUTINE_TEMPLATES.find((t) => t.id === activeTemplate)?.name
        : undefined;
      const routineName = suggestRoutineName({
        custom: name,
        templateName,
        exercises: selected,
      });
      await createRoutine(
        routineName,
        exercises.map((ex, i) => {
          const cat = selected.find((c) => c.name === ex.name);
          return {
            exercise_id: ex.id,
            position: i,
            sets: cat?.default_sets ?? ex.default_sets ?? 3,
            reps: cat?.default_reps ?? ex.default_reps ?? 10,
            duration_sec: cat?.default_duration_sec ?? ex.default_duration_sec ?? null,
          };
        }),
        scheduledDays
      );
      toastSuccess("Routine saved.");
      setDayModal(false);
      router.back();
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const nameLabel = name.trim() ? "Rename" : "Add a name";

  return (
    <Screen padding={false} contentStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <BackHeader title="New routine" />
      <View style={{ paddingTop: 0 }}>
        {nameExpanded ? (
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Name (optional)"
            centered={false}
            autoFocus
          />
        ) : (
          <Pressable onPress={() => setNameExpanded(true)} style={{ paddingVertical: 4 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 14 }}>
              {nameLabel}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 15 }}>Quick start</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
          Pick a template or swipe below
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ marginTop: 8 }}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {ROUTINE_TEMPLATES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => applyTemplate(t.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: activeTemplate === t.id ? colors.star : colors.border,
                backgroundColor: activeTemplate === t.id ? `${colors.star}22` : colors.surface,
              }}
            >
              <Text
                style={{
                  color: activeTemplate === t.id ? colors.star : colors.textSecondary,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {t.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, marginTop: 2 }}>
        <ExerciseSwipePicker
          selectedSlugs={selectedSlugs}
          selectedCount={selected.length}
          onAdd={addExercise}
          onSkip={() => {}}
        />
      </View>

      {selected.length > 0 ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
          <Pressable onPress={() => setPicksOpen((o) => !o)} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
              Your picks ({selected.length}) {picksOpen ? "▲" : "▼"}
            </Text>
          </Pressable>
          {picksOpen
            ? selected.map((ex) => (
                <Pressable
                  key={ex.slug}
                  onPress={() => removeExercise(ex.slug)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, marginLeft: 8 }}>Remove</Text>
                </Pressable>
              ))
            : null}
        </View>
      ) : null}

      <View style={{ marginTop: 12 }}>
        {selected.length === 0 ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            You can save now — we'll name it for you
          </Text>
        ) : null}
        <Button label="Save routine" onPress={openSave} loading={loading && !dayModal} />
      </View>

      <DayScheduleModal
        visible={dayModal}
        onClose={() => setDayModal(false)}
        onConfirm={saveWithDays}
        loading={loading}
      />
    </Screen>
  );
}
