import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen, Button, Input, BackHeader, toastError } from "@/components/ui";
import { Pause as PauseIcon, Play as PlayIcon } from "@/components/icons";
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
  const [paused, setPaused] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    if (!routineId) return;
    getRoutine(routineId)
      .then(setRoutine)
      .catch((e) => {
        console.error(e);
        toastError((e as Error).message);
      });
  }, [routineId]);

  const exercises = routine?.exercises ?? [];
  const current = exercises[exerciseIndex];
  const totalExercises = exercises.length;
  const totalSets = current?.sets ?? 3;
  const restSec = current?.rest_sec ?? 60;

  const confirm = (title: string, message: string, onYes: () => void) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onYes();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "End workout", style: "destructive", onPress: onYes },
    ]);
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
      setFinishing(false);
    }
  };

  const logSet = () => {
    if (!id || !current?.exercise_id) {
      toastError("Workout data is still loading. Try again in a moment.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const repsNum = parseInt(repsInput, 10);
    const weightNum = parseFloat(weightInput);
    const payload = {
      exercise_id: current.exercise_id,
      position: exerciseIndex,
      reps: Number.isFinite(repsNum) && repsNum > 0 ? repsNum : (current.reps ?? undefined),
      weight_kg: Number.isFinite(weightNum) && weightNum > 0 ? weightNum : undefined,
      duration_sec: current.duration_sec ?? undefined,
    };

    const isLastSet = setIndex + 1 >= totalSets;
    const isLastExercise = exerciseIndex + 1 >= totalExercises;
    const isFinalSet = isLastSet && isLastExercise;

    if (isFinalSet) {
      setFinishing(true);
      appendSet(id, payload)
        .then(endSession)
        .catch((e) => {
          console.error(e);
          toastError((e as Error).message);
          setFinishing(false);
        });
      return;
    }

    setRepsInput("");
    setWeightInput("");
    setExpanded(false);
    if (isLastSet) {
      setSetIndex(0);
      setExerciseIndex((i) => i + 1);
    } else {
      setSetIndex((s) => s + 1);
    }
    setResting(true);

    appendSet(id, payload).catch((e) => {
      console.error(e);
      toastError((e as Error).message);
    });
  };

  const onFinishPress = () => {
    confirm("End workout?", "Your logged sets will be saved.", endSession);
  };

  if (routineId && routine && totalExercises === 0) {
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

  const exerciseLabel = totalExercises > 0
    ? `Exercise ${exerciseIndex + 1} of ${totalExercises}`
    : "Workout";

  return (
    <Screen>
      <BackHeader />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", letterSpacing: 1 }}>
          {exerciseLabel.toUpperCase()}
        </Text>
        <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} />
      </View>

      {totalExercises > 0 ? (
        <ProgressDots count={totalExercises} active={exerciseIndex} />
      ) : null}

      {resting ? (
        <RestTimer
          seconds={restSec}
          paused={paused}
          onDone={() => setResting(false)}
          onSkip={() => setResting(false)}
        />
      ) : (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", marginTop: 16 }}>
            {current?.exercise?.name ?? "Workout"}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 15 }}>
            Set {setIndex + 1} of {totalSets}
            {current?.reps ? ` · target ${current.reps} reps` : ""}
          </Text>

          {expanded ? (
            <View style={{ marginTop: 16, gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Reps</Text>
                  <Input
                    value={repsInput}
                    onChangeText={setRepsInput}
                    placeholder={current?.reps ? String(current.reps) : "—"}
                    keyboardType="number-pad"
                    centered
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Weight (kg)</Text>
                  <Input
                    value={weightInput}
                    onChangeText={setWeightInput}
                    placeholder="—"
                    keyboardType="decimal-pad"
                    centered
                  />
                </View>
              </View>
              <Pressable
                onPress={() => setExpanded(false)}
                accessibilityLabel="Hide reps and weight inputs"
                style={{ alignSelf: "center", paddingVertical: 6 }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>Hide</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setExpanded(true)}
              accessibilityLabel="Add reps and weight"
              style={{ alignSelf: "flex-start", paddingVertical: 8, marginTop: 12 }}
            >
              <Text style={{ color: colors.spark, fontSize: 14, fontWeight: "600" }}>
                + Log reps & weight
              </Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          <Button label="Done — next set" onPress={logSet} loading={finishing} />
          <View style={{ marginTop: 12 }}>
            <Button label="Finish workout" variant="secondary" onPress={onFinishPress} />
          </View>
        </>
      )}

      {paused ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(8,8,11,0.94)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", letterSpacing: 2 }}>
            PAUSED
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", marginTop: 12, textAlign: "center" }}>
            Take a breath
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: "center" }}>
            Your workout is paused. Resume when you're ready.
          </Text>
          <View style={{ marginTop: 32, width: "100%", maxWidth: 320 }}>
            <Button label="Resume" onPress={() => setPaused(false)} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      accessibilityLabel={paused ? "Resume workout" : "Pause workout"}
      accessibilityRole="button"
      hitSlop={12}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {paused ? <PlayIcon color={colors.textPrimary} size={20} /> : <PauseIcon color={colors.textPrimary} size={20} />}
    </Pressable>
  );
}

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            backgroundColor: i <= active ? colors.star : colors.border,
          }}
        />
      ))}
    </View>
  );
}
