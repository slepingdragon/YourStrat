import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { RoutineCard } from "@/components/RoutineCard";
import { RpePicker } from "@/components/RpePicker";
import { Dumbbell } from "@/components/icons";
import { Screen, Button, Card, toastError, toastSuccess } from "@/components/ui";
import { deleteRoutine, getRoutine, listRoutines, startSession, type Routine } from "@/lib/api";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function dayLabel(dayIndex: number, todayIndex: number): string {
  if (dayIndex === todayIndex) return `Today · ${FULL_DAY_NAMES[dayIndex]}`;
  if (dayIndex === (todayIndex + 1) % 7) return `Tomorrow · ${FULL_DAY_NAMES[dayIndex]}`;
  return FULL_DAY_NAMES[dayIndex];
}

function dayOrderFromToday(): number[] {
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => (today + i) % 7);
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [pendingRoutineId, setPendingRoutineId] = useState<string | null>(null);
  const [plannedRpe, setPlannedRpe] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

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

  const promptStart = (id: string) => {
    setPendingRoutineId(id);
    setPlannedRpe(null);
  };

  const dismissPrompt = () => {
    setPendingRoutineId(null);
    setPlannedRpe(null);
  };

  const confirmStart = async (skipRpe: boolean) => {
    if (!pendingRoutineId) return;
    setStarting(true);
    try {
      const routine = await getRoutine(pendingRoutineId);
      if (!routine.exercises?.length) {
        toastError("Add exercises to this routine before starting.");
        return;
      }
      const session = await startSession(pendingRoutineId, skipRpe ? undefined : plannedRpe ?? undefined);
      const target = pendingRoutineId;
      dismissPrompt();
      router.push({ pathname: "/session/[id]", params: { id: session.id, routineId: target } });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const removeRoutine = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteRoutine(id);
      toastSuccess("Routine deleted.");
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
      await load();
    }
  };

  const { byDay, anytime, todayIndex, dayOrder } = useMemo(() => {
    const todayIndex = new Date().getDay();
    const dayOrder = dayOrderFromToday();
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
    return { byDay, anytime, todayIndex, dayOrder };
  }, [routines]);

  return (
    <Screen scroll scrollGrow={false}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", lineHeight: 34 }}>
            Workouts
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: 15, lineHeight: 22 }}>
            Your week, one day at a time.
          </Text>
        </View>
        <Button
          label="New"
          variant="secondary"
          compact
          fullWidth={false}
          onPress={() => router.push("/routine/new")}
        />
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
            No routines yet
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: spacing.sm,
              fontSize: 15,
              lineHeight: 22,
              textAlign: "center",
            }}
          >
            Build your first plan, schedule it on the days you train, and start a session when you're ready.
          </Text>
          <View style={{ marginTop: spacing.xl, alignSelf: "stretch" }}>
            <Button label="New routine" onPress={() => router.push("/routine/new")} />
          </View>
        </Card>
      ) : (
        <View style={{ marginTop: spacing.xl }}>
          {dayOrder.map((d) => {
            const list = byDay[d] ?? [];
            const isToday = d === todayIndex;
            return (
              <View key={d} style={{ marginBottom: spacing.xl }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: spacing.md,
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isToday ? colors.star : colors.border,
                    }}
                  />
                  <Text
                    style={{
                      color: isToday ? colors.textPrimary : colors.textMuted,
                      fontSize: 13,
                      fontWeight: "700",
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    {dayLabel(d, todayIndex)}
                  </Text>
                </View>
                {list.length === 0 ? (
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      lineHeight: 20,
                      paddingHorizontal: spacing.xs,
                    }}
                  >
                    Rest day. Nothing scheduled.
                  </Text>
                ) : (
                  list.map((r) => (
                    <RoutineCard
                      key={`${d}-${r.id}`}
                      routine={r}
                      onOpen={() => router.push(`/routine/${r.id}`)}
                      onStart={() => promptStart(r.id)}
                      onDelete={() => removeRoutine(r.id)}
                    />
                  ))
                )}
              </View>
            );
          })}

          {anytime.length > 0 ? (
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.border,
                  }}
                />
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  Anytime · no day set
                </Text>
              </View>
              {anytime.map((r) => (
                <RoutineCard
                  key={`anytime-${r.id}`}
                  routine={r}
                  onOpen={() => router.push(`/routine/${r.id}`)}
                  onStart={() => promptStart(r.id)}
                  onDelete={() => removeRoutine(r.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      )}

      <Modal
        visible={pendingRoutineId !== null}
        transparent
        animationType="fade"
        onRequestClose={dismissPrompt}
      >
        <Pressable
          onPress={dismissPrompt}
          accessibilityRole="button"
          accessibilityLabel="Close effort picker"
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xl,
              paddingBottom: spacing.xxl,
              gap: spacing.lg,
            }}
          >
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>
                How hard will you push today?
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 }}>
                Set your target effort on the 1–10 scale. You'll rate how it actually went after.
              </Text>
            </View>
            <RpePicker value={plannedRpe} onChange={setPlannedRpe} />
            <View style={{ gap: spacing.sm }}>
              <Button
                label={plannedRpe ? `Start at ${plannedRpe}/10` : "Pick a target"}
                onPress={() => confirmStart(false)}
                disabled={plannedRpe == null}
                loading={starting}
              />
              <Button
                label="Skip & start"
                variant="ghost"
                onPress={() => confirmStart(true)}
                disabled={starting}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
