import { useCallback, useMemo, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { RoutineCard } from "@/components/RoutineCard";
import { DayChipStrip } from "@/components/DayChipStrip";
import { ActiveSessionRunner } from "@/components/session/ActiveSessionRunner";
import { Dumbbell } from "@/components/icons";
import { Screen, Button, Card, toastError, toastSuccess } from "@/components/ui";
import { deleteRoutine, getRoutine, listRoutines, startSession, type Routine } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useT, translate } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const DAY_SHORT_KEYS = [
  "workout.dayShort.sun",
  "workout.dayShort.mon",
  "workout.dayShort.tue",
  "workout.dayShort.wed",
  "workout.dayShort.thu",
  "workout.dayShort.fri",
  "workout.dayShort.sat",
] as const;
const ANYTIME_KEY = -1;

function dayCaption(dayIndex: number, todayIndex: number): string {
  if (dayIndex === ANYTIME_KEY) return translate("workout.anytime");
  if (dayIndex === todayIndex) return translate("workout.today");
  if (dayIndex === (todayIndex + 1) % 7) return translate("workout.tomorrow");
  return translate(DAY_SHORT_KEYS[dayIndex]);
}

export default function WorkoutsScreen() {
  const t = useT();
  const router = useRouter();
  const session = useStore((s) => s.session);
  const activeSession = useStore((s) => s.activeSession);
  const setActiveSession = useStore((s) => s.setActiveSession);
  const clearActiveSession = useStore((s) => s.clearActiveSession);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [startingId, setStartingId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const offsetsRef = useRef<Record<number, number>>({});
  const todayIndex = new Date().getDay();
  const [activeDay, setActiveDay] = useState(todayIndex);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setRoutines(await listRoutines());
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const startRoutine = async (routineId: string, rpe: number | null) => {
    if (startingId) return;
    setStartingId(routineId);
    try {
      const routine = await getRoutine(routineId);
      if (!routine.exercises?.length) {
        toastError(t("workout.addExercisesFirst"));
        return;
      }
      const started = await startSession(routineId, rpe ?? undefined);
      // Take over the Workouts tab with the live session (W-C2) — no push.
      setActiveSession({ id: started.id, routineId });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setStartingId(null);
    }
  };

  const removeRoutine = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteRoutine(id);
      toastSuccess(t("workout.routineDeleted"));
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
      await load();
    }
  };

  const { groups, dayOrder } = useMemo(() => {
    const order = Array.from({ length: 7 }, (_, i) => (todayIndex + i) % 7);
    const byDay: Record<number, Routine[]> = {};
    const anytime: Routine[] = [];
    for (const r of routines) {
      const days = r.scheduled_days ?? [];
      if (!days.length) {
        anytime.push(r);
        continue;
      }
      for (const d of days) {
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(r);
      }
    }
    const groups: { key: number; routines: Routine[] }[] = order.map((d) => ({ key: d, routines: byDay[d] ?? [] }));
    if (anytime.length) groups.push({ key: ANYTIME_KEY, routines: anytime });
    return { groups, dayOrder: order };
  }, [routines, todayIndex]);

  const scrollToDay = (day: number) => {
    setActiveDay(day);
    const y = offsetsRef.current[day];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 4), animated: true });
  };

  // Scroll-spy: highlight the topmost day group currently scrolled into view.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + 8;
    let current = dayOrder[0];
    for (const g of groups) {
      if (g.key === ANYTIME_KEY) continue; // no chip for Anytime — keep last day lit
      const top = offsetsRef.current[g.key];
      if (top != null && top <= y) current = g.key;
    }
    if (current !== activeDay) setActiveDay(current);
  };

  // W-C2 takeover: while a session is in flight, the tab is the live runner.
  if (activeSession) {
    return (
      <ActiveSessionRunner
        key={activeSession.id}
        sessionId={activeSession.id}
        routineId={activeSession.routineId}
        onFinished={(burned, duration) => {
          clearActiveSession();
          router.push({
            pathname: "/session/[id]/summary",
            params: { id: activeSession.id, burned: String(burned), duration: String(duration) },
          });
        }}
      />
    );
  }

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", lineHeight: 34 }}>
          {t("workout.screenTitle")}
        </Text>
        <Button label={t("workout.new")} variant="secondary" compact fullWidth={false} onPress={() => router.push("/routine/new")} />
      </View>

      {routines.length === 0 ? (
        <Card
          style={{
            marginTop: spacing.xl,
            alignItems: "center",
            backgroundColor: colors.surfaceElevated,
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.xl,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.lg,
            }}
          >
            <Dumbbell color={colors.textMuted} size={24} />
          </View>
          <Text style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 17, textAlign: "center" }}>
            {t("workout.noRoutinesTitle")}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: 15, lineHeight: 22, textAlign: "center" }}>
            {t("workout.noRoutinesBody")}
          </Text>
          <View style={{ marginTop: spacing.xl, alignSelf: "stretch" }}>
            <Button label={t("workout.newRoutine")} onPress={() => router.push("/routine/new")} />
          </View>
        </Card>
      ) : (
        <>
          <View style={{ marginTop: spacing.lg }}>
            <DayChipStrip dayOrder={dayOrder} todayIndex={todayIndex} activeDay={activeDay} onSelect={scrollToDay} />
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1, marginTop: spacing.lg }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
          >
            {groups.map((g) => (
              <View
                key={g.key}
                onLayout={(e) => {
                  offsetsRef.current[g.key] = e.nativeEvent.layout.y;
                }}
                style={{ marginBottom: spacing.xl }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      color: g.key === todayIndex ? colors.textSecondary : colors.textMuted,
                      fontSize: 11,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    {dayCaption(g.key, todayIndex)}
                  </Text>
                  {g.routines.length === 0 ? (
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t("workout.restDay")}</Text>
                  ) : null}
                </View>
                {g.routines.map((r) => (
                  <RoutineCard
                    key={`${g.key}-${r.id}`}
                    routine={r}
                    starting={startingId === r.id}
                    onOpen={() => router.push(`/routine/${r.id}`)}
                    onStart={(rpe) => startRoutine(r.id, rpe)}
                    onDelete={() => removeRoutine(r.id)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}
