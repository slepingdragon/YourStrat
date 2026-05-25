import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Button, BackHeader, Skeleton, toastError } from "@/components/ui";
import { ExerciseRow } from "@/components/ExerciseRow";
import { getRoutine, startSession, type Routine } from "@/lib/api";
import { displayRoutineName } from "@/lib/routineName";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function RoutineDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setActiveSession = useStore((s) => s.setActiveSession);
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (!id) return;
    getRoutine(id).then(setRoutine).catch((e) => {
      console.error(e);
      toastError((e as Error).message);
    });
  }, [id]);

  const start = async () => {
    if (!id) return;
    if (!routine?.exercises?.length) {
      toastError(t("workout.addExercisesFirst"));
      return;
    }
    try {
      const session = await startSession(id);
      // Hand off to the Workouts-tab takeover (W-C2); leave this detail screen.
      setActiveSession({ id: session.id, routineId: id });
      router.replace("/workouts");
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  };

  if (!routine) {
    return (
      <Screen>
        <BackHeader />
        <Skeleton width="60%" height={28} radius={6} />
        <View style={{ height: 12 }} />
        <Skeleton width="40%" height={16} radius={6} />
        <View style={{ height: 24 }} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Skeleton height={56} radius={12} />
          </View>
        ))}
      </Screen>
    );
  }

  const exercises = routine.exercises ?? [];
  const canStart = exercises.length > 0;

  return (
    <Screen scroll>
      <BackHeader />
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>
        {displayRoutineName(routine.name)}
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
        {canStart ? t("routine.exercisesCount", { n: exercises.length }) : t("routine.noExercisesYet")}
      </Text>
      {exercises.map((re) => (
        <ExerciseRow
          key={re.position}
          name={re.exercise?.name ?? t("routine.exerciseFallback")}
          sets={re.sets}
          reps={re.reps}
          durationSec={re.duration_sec}
        />
      ))}
      <View style={{ marginTop: 24 }}>
        <Button
          label={t("routine.startWorkout")}
          onPress={start}
          disabled={!canStart}
        />
        {!canStart ? (
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 }}>
            {t("routine.buildBeforeStart")}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
