import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Screen, Button, Input, toastError } from "@/components/ui";
import { Pause as PauseIcon, Play as PlayIcon } from "@/components/icons";
import { RestTimer } from "@/components/RestTimer";
import { WeightHero } from "@/components/session/WeightHero";
import { SetSpreadsheet, type LoggedSet } from "@/components/session/SetSpreadsheet";
import { appendSet, finishSession, getRoutine, type Routine } from "@/lib/api";
import { kgToLbs, lbsToKg } from "@/lib/targets";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  sessionId: string;
  routineId: string | null;
  /** Called after the session is finished server-side; the host clears the
   * active-session pointer and shows the summary. */
  onFinished: (burned: number, durationSec: number) => void;
};

/**
 * The live workout runner. Rendered inside the Workouts tab when a session is
 * active (W-C2, Story 5.6 — takeover/badge/cold-start unchanged). Story 5.7
 * reworks the body into a readable instrument (UX-DR18 WeightHero + UX-DR19
 * Strong-style spreadsheet) with a peripheral rest strip. Set/exercise progress
 * is local (ephemeral); only the rest deadline is mirrored to Zustand.
 */
export function ActiveSessionRunner({ sessionId, routineId, onFinished }: Props) {
  const setRestEndsAt = useStore((s) => s.setRestEndsAt);
  const units = useStore((s) => s.profile?.units) ?? "metric";
  const unit = units === "imperial" ? "lb" : "kg";

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [resting, setResting] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restNonce, setRestNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  // Carry-forward weight within the current exercise (display units, kg-canonical
  // for storage). Null at the first set of an exercise — never bleeds across.
  const [lastWeightKg, setLastWeightKg] = useState<number | null>(null);
  // Per-exercise logged sets (display-unit weights) for the spreadsheet.
  const [log, setLog] = useState<LoggedSet[][]>([]);

  // kg (stored/canonical) -> a rounded number in the user's display units.
  const kgToDisplayNum = (kg: number) => (units === "imperial" ? Math.round(kgToLbs(kg)) : Math.round(kg * 2) / 2);
  // a number typed in display units -> kg for the API.
  const displayToKg = (n: number) => (units === "imperial" ? lbsToKg(n) : n);

  useEffect(() => {
    if (!routineId) return;
    getRoutine(routineId)
      .then((r) => {
        setRoutine(r);
        const first = r.exercises?.[0];
        setRepsInput(first?.reps != null ? String(first.reps) : "");
        setWeightInput("");
      })
      .catch((e) => {
        console.error(e);
        toastError((e as Error).message);
      });
  }, [routineId]);

  // NOTE: deliberately no unmount cleanup of restEndsAt (5.6 blur fix). If the
  // tab navigator unmounts this screen on blur, the rest deadline must survive
  // so the tab badge keeps counting. Finish and a new rest are the only writers.

  const exercises = routine?.exercises ?? [];
  const current = exercises[exerciseIndex];
  const totalExercises = exercises.length;
  const totalSets = current?.sets ?? 3;

  // Prefill the entry fields for the set we just advanced to.
  const prefillFor = (exIdx: number, carryWeightKg: number | null) => {
    const ex = exercises[exIdx];
    setRepsInput(ex?.reps != null ? String(ex.reps) : "");
    setWeightInput(carryWeightKg != null ? String(kgToDisplayNum(carryWeightKg)) : "");
  };

  const beginRest = (durationSec: number) => {
    setRestDuration(durationSec);
    setRestEndsAt(Date.now() + durationSec * 1000);
    setRestNonce((n) => n + 1);
    setResting(true);
  };

  // Stable identity: it's a dep of RestTimer's tick effect, so a new closure
  // each render (e.g. while typing during a rest) would reset the countdown.
  const endRest = useCallback(() => {
    setRestEndsAt(null);
    setResting(false);
  }, [setRestEndsAt]);

  // Spreadsheet rows depend only on the routine — memoized off `routine` (not
  // the per-render `exercises` array) so keystrokes don't re-render the grid.
  const rows = useMemo(
    () => (routine?.exercises ?? []).map((e) => ({ name: e.exercise?.name ?? "Exercise", sets: e.sets ?? 3 })),
    [routine]
  );

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
    if (!sessionId) return;
    setFinishing(true);
    try {
      const session = await finishSession(sessionId);
      setRestEndsAt(null);
      onFinished(session.calories_burned, session.duration_sec ?? 0);
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
      setFinishing(false);
    }
  };

  const logSet = () => {
    if (!sessionId || !current?.exercise_id) {
      toastError("Workout data is still loading. Try again in a moment.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const repsNum = parseInt(repsInput, 10);
    const weightNum = parseFloat(weightInput); // display units
    const hasReps = Number.isFinite(repsNum) && repsNum > 0;
    const hasWeight = Number.isFinite(weightNum) && weightNum > 0;
    const enteredWeightKg = hasWeight ? displayToKg(weightNum) : null;
    const loggedReps = hasReps ? repsNum : current.reps ?? null;

    const payload = {
      exercise_id: current.exercise_id,
      position: exerciseIndex,
      reps: hasReps ? repsNum : current.reps ?? undefined,
      weight_kg: enteredWeightKg ?? undefined,
      duration_sec: current.duration_sec ?? undefined,
    };

    // Record the set for the spreadsheet (display-unit weight).
    setLog((prev) => {
      const next = prev.map((r) => r.slice());
      while (next.length <= exerciseIndex) next.push([]);
      const row = next[exerciseIndex];
      row[setIndex] = { weight: hasWeight ? weightNum : null, reps: loggedReps };
      return next;
    });

    const isLastSet = setIndex + 1 >= totalSets;
    const isLastExercise = exerciseIndex + 1 >= totalExercises;
    const isFinalSet = isLastSet && isLastExercise;

    if (isFinalSet) {
      setFinishing(true);
      appendSet(sessionId, payload)
        .then(endSession)
        .catch((e) => {
          console.error(e);
          toastError((e as Error).message);
          setFinishing(false);
        });
      return;
    }

    const restSec = current.rest_sec ?? 60; // rest after the set just completed
    if (isLastSet) {
      const nextEx = exerciseIndex + 1;
      setSetIndex(0);
      setExerciseIndex(nextEx);
      setLastWeightKg(null); // new exercise — drop carry-forward
      prefillFor(nextEx, null);
    } else {
      const carry = enteredWeightKg ?? lastWeightKg;
      setLastWeightKg(carry);
      setSetIndex((s) => s + 1);
      prefillFor(exerciseIndex, carry);
    }
    beginRest(restSec);

    appendSet(sessionId, payload).catch((e) => {
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
        <Text style={{ color: colors.textSecondary, lineHeight: 22, marginTop: spacing.xl }}>
          This routine has no exercises. Add some in Workouts, then start again.
        </Text>
        <View style={{ marginTop: spacing.lg }}>
          <Button label="End session" variant="secondary" onPress={endSession} loading={finishing} />
        </View>
      </Screen>
    );
  }

  const exerciseName = current?.exercise?.name ?? "Workout";
  const heroWeight = weightInput.trim() !== "" ? weightInput.trim() : "—";
  const repsText = repsInput.trim() !== "" ? repsInput.trim() : current?.reps != null ? String(current.reps) : "";
  const subline = repsText ? `× ${repsText} reps` : "reps —";
  const heroA11y =
    heroWeight === "—"
      ? `${exerciseName}, set ${setIndex + 1} of ${totalSets}, ${repsText || "—"} reps`
      : `${exerciseName}, ${heroWeight} ${unit}, ${repsText || "—"} reps, set ${setIndex + 1} of ${totalSets}`;

  return (
    <Screen scroll>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: spacing.xs }}>
        <View style={{ flex: 1, minWidth: 0, paddingRight: spacing.md }}>
          <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700" }}>
            {exerciseName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", marginTop: 2 }}>
            Set {setIndex + 1} of {totalSets}
            {totalExercises > 0 ? ` · Exercise ${exerciseIndex + 1} of ${totalExercises}` : ""}
          </Text>
        </View>
        <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} />
      </View>

      {totalExercises > 0 ? <ProgressDots count={totalExercises} active={exerciseIndex} /> : null}

      {resting ? (
        <RestTimer
          key={restNonce}
          compact
          seconds={restDuration}
          paused={paused}
          onDone={endRest}
          onSkip={endRest}
        />
      ) : null}

      <WeightHero weight={heroWeight} unit={unit} subline={subline} accessibilityLabel={heroA11y} />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs }}>Weight ({unit})</Text>
          <Input
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="—"
            keyboardType="decimal-pad"
            centered
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs }}>Reps</Text>
          <Input
            value={repsInput}
            onChangeText={setRepsInput}
            placeholder={current?.reps != null ? String(current.reps) : "—"}
            keyboardType="number-pad"
            centered
          />
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          label={exerciseIndex + 1 >= totalExercises && setIndex + 1 >= totalSets ? "Log set & finish" : "Log set"}
          onPress={logSet}
          loading={finishing}
        />
      </View>

      <SetSpreadsheet rows={rows} log={log} activeExercise={exerciseIndex} activeSet={setIndex} unit={unit} />

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
        <Button label="Finish workout" variant="secondary" onPress={onFinishPress} />
      </View>

      <Modal visible={paused} transparent animationType="fade" onRequestClose={() => setPaused(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(8,8,11,0.94)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", letterSpacing: 2 }}>PAUSED</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "700", marginTop: spacing.md, textAlign: "center" }}>
            Take a breath
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, textAlign: "center" }}>
            Your workout is paused. Resume when you're ready.
          </Text>
          <View style={{ marginTop: spacing.xxl, width: "100%", maxWidth: 320 }}>
            <Button label="Resume" onPress={() => setPaused(false)} />
          </View>
        </View>
      </Modal>
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
    <View style={{ flexDirection: "row", gap: 6, marginTop: spacing.md }}>
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
