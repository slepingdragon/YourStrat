import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DayScheduleModal } from "@/components/DayScheduleModal";
import { ExerciseSwipePicker } from "@/components/ExerciseSwipePicker";
import { ChevronDown } from "@/components/icons";
import { Screen, Button, Input, BackHeader, toastError, toastSuccess } from "@/components/ui";
import { createRoutine } from "@/lib/api";
import {
  catalogBySlug,
  ROUTINE_TEMPLATES,
  type CatalogExercise,
} from "@/lib/exerciseCatalog";
import { resolveCatalogToExercises } from "@/lib/resolveExercises";
import { suggestRoutineName } from "@/lib/routineName";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const REST_PRESETS_SEC = [30, 60, 90, 120];
const DEFAULT_REST_SEC = 60;

function formatRest(sec: number): string {
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
  }
  return `${sec}s`;
}

type RestRowProps = { value: number; onChange: (sec: number) => void };
function RestRow({ value, onChange }: RestRowProps) {
  const t = useT();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: spacing.xs }}>{t("routine.rest")}</Text>
      {REST_PRESETS_SEC.map((sec) => {
        const active = sec === value;
        return (
          <Pressable
            key={sec}
            onPress={() => onChange(sec)}
            accessibilityRole="button"
            accessibilityLabel={t("routine.restLabelA11y", { time: formatRest(sec) })}
            accessibilityState={{ selected: active }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? colors.star : colors.border,
              backgroundColor: active ? `${colors.star}22` : "transparent",
            }}
          >
            <Text style={{ color: active ? colors.star : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
              {formatRest(sec)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function NewRoutineScreen() {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameExpanded, setNameExpanded] = useState(false);
  const [selected, setSelected] = useState<CatalogExercise[]>([]);
  const [restBySlug, setRestBySlug] = useState<Record<string, number>>({});
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
    setRestBySlug((prev) => {
      const next = { ...prev };
      for (const it of items) if (next[it.slug] === undefined) next[it.slug] = DEFAULT_REST_SEC;
      return next;
    });
  };

  const addExercise = (exercise: CatalogExercise) => {
    if (selectedSlugs.has(exercise.slug)) return;
    setSelected((s) => [...s, exercise]);
    setRestBySlug((r) => (r[exercise.slug] === undefined ? { ...r, [exercise.slug]: DEFAULT_REST_SEC } : r));
  };

  const removeExercise = (slug: string) => {
    setSelected((s) => s.filter((e) => e.slug !== slug));
    setRestBySlug((r) => {
      const next = { ...r };
      delete next[slug];
      return next;
    });
  };

  const setRestFor = (slug: string, sec: number) => {
    setRestBySlug((r) => ({ ...r, [slug]: sec }));
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
          const slug = cat?.slug;
          return {
            exercise_id: ex.id,
            position: i,
            sets: cat?.default_sets ?? ex.default_sets ?? 3,
            reps: cat?.default_reps ?? ex.default_reps ?? 10,
            duration_sec: cat?.default_duration_sec ?? ex.default_duration_sec ?? null,
            rest_sec: slug ? restBySlug[slug] ?? DEFAULT_REST_SEC : DEFAULT_REST_SEC,
          };
        }),
        scheduledDays
      );
      toastSuccess(t("routine.saved"));
      setDayModal(false);
      router.back();
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const nameLabel = name.trim() ? t("routine.rename") : t("routine.addName");

  return (
    <Screen padding={false} contentStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <BackHeader title={t("routine.newTitle")} />
      <View style={{ paddingTop: 0 }}>
        {nameExpanded ? (
          <Input
            value={name}
            onChangeText={setName}
            placeholder={t("routine.namePlaceholder")}
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
        <Text style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 15 }}>{t("routine.quickStart")}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.xs }}>
          {t("routine.quickStartHint")}
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
          onRemove={removeExercise}
        />
      </View>

      {selected.length > 0 ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
          <Pressable
            onPress={() => setPicksOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityLabel={picksOpen ? t("routine.collapsePicks") : t("routine.expandPicks")}
            accessibilityState={{ expanded: picksOpen }}
            style={{ paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
              {t("routine.yourPicks", { n: selected.length })}
            </Text>
            <View style={{ transform: [{ rotate: picksOpen ? "180deg" : "0deg" }] }}>
              <ChevronDown color={colors.textPrimary} size={18} />
            </View>
          </Pressable>
          {picksOpen
            ? selected.map((ex) => (
                <View
                  key={ex.slug}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                      {ex.name}
                    </Text>
                    <Pressable
                      onPress={() => removeExercise(ex.slug)}
                      accessibilityLabel={t("routine.removeNamed", { name: ex.name })}
                      hitSlop={8}
                    >
                      <Text style={{ color: colors.textMuted, marginLeft: spacing.sm }}>{t("routine.remove")}</Text>
                    </Pressable>
                  </View>
                  <RestRow
                    value={restBySlug[ex.slug] ?? DEFAULT_REST_SEC}
                    onChange={(sec) => setRestFor(ex.slug, sec)}
                  />
                </View>
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
              marginBottom: spacing.sm,
            }}
          >
            {t("routine.saveNowHint")}
          </Text>
        ) : null}
        <Button label={t("routine.save")} onPress={openSave} loading={loading && !dayModal} />
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
