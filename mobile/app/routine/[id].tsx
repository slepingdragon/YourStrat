import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Button, BackHeader, toastError } from "@/components/ui";
import { ExerciseRow } from "@/components/ExerciseRow";
import { getRoutine, startSession, type Routine } from "@/lib/api";
import { colors } from "@/theme/colors";

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
      toastError("Add exercises to this routine before starting.");
      return;
    }
    try {
      const session = await startSession(id);
      router.push({ pathname: "/session/[id]", params: { id: session.id, routineId: id } });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  };

  if (!routine) {
    return (
      <Screen>
        <BackHeader />
        <Text style={{ color: colors.textMuted }}>Loading...</Text>
      </Screen>
    );
  }

  const exercises = routine.exercises ?? [];
  const canStart = exercises.length > 0;

  return (
    <Screen scroll>
      <BackHeader />
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>{routine.name}</Text>
      <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
        {canStart ? `${exercises.length} exercises` : "No exercises in this routine yet."}
      </Text>
      {exercises.map((re) => (
        <ExerciseRow
          key={re.position}
          name={re.exercise?.name ?? "Exercise"}
          sets={re.sets}
          reps={re.reps}
          durationSec={re.duration_sec}
        />
      ))}
      <View style={{ marginTop: 24 }}>
        <Button
          label="Start workout"
          onPress={start}
          disabled={!canStart}
        />
        {!canStart ? (
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 20 }}>
            Build this routine with at least one exercise before you start.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
