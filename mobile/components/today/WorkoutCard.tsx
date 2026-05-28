import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { startSession, type TodaySnapshot } from "@/lib/api";
import { toastError } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { glassInline } from "@/theme/glass";
import { spacing } from "@/theme/spacing";

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

function PulsingDot({ color }: { color: string }) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        dotStyle,
      ]}
    />
  );
}

export function WorkoutCard({ today }: Props) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const state = pickState(today);

  const topLabel = t("workoutCard.title");
  let borderColor = colors.border;
  let headline = t("workoutCard.noneHeadline");
  let sub = t("workoutCard.noneSub");
  let headlineColor = colors.textPrimary;
  let dot: string | null = null;

  if (state.kind === "in_progress") {
    borderColor = colors.spark;
    headline = state.name;
    sub = t("workoutCard.inProgress");
    dot = colors.spark;
  } else if (state.kind === "completed") {
    borderColor = colors.success;
    headline = state.name;
    sub = t("workoutCard.completedSub", { min: state.minutes, kcal: state.calories });
  } else if (state.kind === "scheduled") {
    borderColor = colors.spark;
    headline = state.name;
    sub = t("workoutCard.scheduled");
    headlineColor = colors.textPrimary;
  } else {
    headline = t("workoutCard.noneHeadline");
    sub = t("workoutCard.noneSub");
    headlineColor = colors.textSecondary;
  }

  const onPress = async () => {
    if (busy) return;
    if (state.kind === "in_progress") {
      router.push({ pathname: "/session/[id]", params: { id: state.sessionId, routineId: state.routineId ?? "" } });
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
        router.push({ pathname: "/session/[id]", params: { id: s.id, routineId: state.routineId } });
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
        ...glassInline.card,
        borderRadius: 12,
        borderColor,
        padding: 14,
        opacity: pressed || busy ? 0.85 : 1,
        alignItems: "center",
      })}
      accessibilityRole="button"
      accessibilityLabel={t("workoutCard.a11y", { label: topLabel, headline, sub })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.xs + 2,
          gap: 6,
          alignSelf: "stretch",
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", textAlign: "center" }}>
          {topLabel}
        </Text>
        {dot ? <PulsingDot color={dot} /> : null}
      </View>
      <Text
        style={{
          color: headlineColor,
          fontSize: 15,
          fontWeight: "700",
          lineHeight: 20,
          textAlign: "center",
          alignSelf: "stretch",
        }}
      >
        {headline}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          marginTop: 4,
          fontVariant: ["tabular-nums"],
          lineHeight: 16,
          textAlign: "center",
          alignSelf: "stretch",
        }}
      >
        {sub}
      </Text>
    </Pressable>
  );
}
