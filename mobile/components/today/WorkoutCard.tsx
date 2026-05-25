import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { startSession, type TodaySnapshot } from "@/lib/api";
import { toastError } from "@/components/ui";
import { formatKcal } from "@/lib/format";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

type Props = {
  today: TodaySnapshot;
};

type CardState =
  | { kind: "in_progress"; name: string; sessionId: string; routineId: string | null }
  | { kind: "completed"; name: string; sessionId: string; minutes: number; calories: number }
  | { kind: "scheduled"; name: string; routineId: string }
  | { kind: "none" };

function pickState(today: TodaySnapshot): CardState {
  if (today.active_session) {
    return {
      kind: "in_progress",
      name: today.active_session.routine_name ?? "Workout",
      sessionId: today.active_session.id,
      routineId: today.active_session.routine_id,
    };
  }
  if (today.last_completed_session_today) {
    const c = today.last_completed_session_today;
    return {
      kind: "completed",
      name: c.routine_name ?? "Workout",
      sessionId: c.id,
      minutes: Math.round((c.duration_sec ?? 0) / 60),
      calories: c.calories_burned,
    };
  }
  if (today.scheduled_routine_today) {
    return {
      kind: "scheduled",
      name: today.scheduled_routine_today.name,
      routineId: today.scheduled_routine_today.id,
    };
  }
  return { kind: "none" };
}

export function WorkoutCard({ today }: Props) {
  const router = useRouter();
  const setActiveSession = useStore((s) => s.setActiveSession);
  const [busy, setBusy] = useState(false);
  const state = pickState(today);

  let borderColor = colors.border;
  let topLabel = "Workout";
  let headline = "No workout planned";
  let sub = "Add a routine";
  let headlineColor = colors.textPrimary;
  let dot: string | null = null;

  if (state.kind === "in_progress") {
    borderColor = colors.spark;
    topLabel = "Workout";
    headline = state.name;
    sub = "In progress";
    dot = colors.spark;
  } else if (state.kind === "completed") {
    borderColor = colors.success;
    topLabel = "Workout";
    headline = state.name;
    sub = `${state.minutes} min · ${formatKcal(state.calories)} cal`;
  } else if (state.kind === "scheduled") {
    borderColor = colors.spark;
    topLabel = "Workout";
    headline = state.name;
    sub = "Scheduled today";
    headlineColor = colors.textPrimary;
  } else {
    topLabel = "Workout";
    headline = "No workout planned";
    sub = "Add a routine";
    headlineColor = colors.textSecondary;
  }

  const onPress = async () => {
    if (busy) return;
    if (state.kind === "in_progress") {
      // Resume via the Workouts-tab takeover (W-C2).
      setActiveSession({ id: state.sessionId, routineId: state.routineId });
      router.push("/workouts");
      return;
    }
    if (state.kind === "completed") {
      router.push({ pathname: "/session/[id]/summary", params: { id: state.sessionId } });
      return;
    }
    if (state.kind === "scheduled") {
      setBusy(true);
      try {
        const s = await startSession(state.routineId);
        setActiveSession({ id: s.id, routineId: state.routineId });
        router.push("/workouts");
      } catch (e) {
        console.error(e);
        toastError((e as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }
    router.push("/workouts");
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => ({
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor,
        padding: 14,
        opacity: pressed || busy ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${topLabel}: ${headline}, ${sub}`}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", flex: 1 }}>{topLabel}</Text>
        {dot ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: dot,
            }}
          />
        ) : null}
      </View>
      <Text
        style={{
          color: headlineColor,
          fontSize: 16,
          fontWeight: "700",
        }}
        numberOfLines={1}
      >
        {headline}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          marginTop: 4,
          fontVariant: ["tabular-nums"],
        }}
        numberOfLines={1}
      >
        {sub}
      </Text>
    </Pressable>
  );
}
