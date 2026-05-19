import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Button, BackHeader, toastError } from "@/components/ui";
import { RestTimer } from "@/components/RestTimer";
import { appendSet, finishSession, getRoutine, type Routine } from "@/lib/api";
import { colors } from "@/theme/colors";

export default function ActiveSessionScreen() {
  const { id, routineId } = useLocalSearchParams<{ id: string; routineId?: string }>();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [resting, setResting] = useState(false);
  const [restSec] = useState(60);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!routineId) return;
    getRoutine(routineId)
      .then(setRoutine)
      .catch((e) => {
        console.error(e);
        toastError((e as Error).message);
      });
  }, [routineId]);

  const current = routine?.exercises?.[exerciseIndex];
  const totalSets = current?.sets ?? 3;

  const logSet = async () => {
    if (!id || !current?.exercise_id) {
      toastError("Workout data is still loading. Try again in a moment.");
      return;
    }
    try {
      await appendSet(id, {
        exercise_id: current.exercise_id,
        position: exerciseIndex,
        reps: current.reps ?? undefined,
        duration_sec: current.duration_sec ?? undefined,
      });
      if (setIndex + 1 >= totalSets) {
        setSetIndex(0);
        if (exerciseIndex + 1 >= (routine?.exercises?.length ?? 0)) {
          await endSession();
        } else {
          setExerciseIndex((i) => i + 1);
          setResting(true);
        }
      } else {
        setSetIndex((s) => s + 1);
        setResting(true);
      }
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  };

  const endSession = async () => {
    if (!id) return;
    setFinishing(true);
    try {
      const session = await finishSession(id);
      router.replace({
        pathname: "/session/[id]/summary",
        params: { id, burned: String(session.calories_burned), duration: String(session.duration_sec ?? 0) },
      });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setFinishing(false);
    }
  };

  if (resting) {
    return (
      <Screen>
        <BackHeader />
        <RestTimer seconds={restSec} onDone={() => setResting(false)} onSkip={() => setResting(false)} />
      </Screen>
    );
  }

  if (routineId && routine && !routine.exercises?.length) {
    return (
      <Screen>
        <BackHeader />
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          This routine has no exercises. Add some in Workouts, then start again.
        </Text>
        <View style={{ marginTop: 20 }}>
          <Button label="Back to workouts" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader />
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>
        {current?.exercise?.name ?? "Workout"}
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
        Set {setIndex + 1} of {totalSets}
      </Text>
      <View style={{ flex: 1 }} />
      <Button label="Complete set" onPress={logSet} loading={finishing} />
      <View style={{ marginTop: 12 }}>
        <Button label="Finish workout" variant="secondary" onPress={endSession} />
      </View>
    </Screen>
  );
}
