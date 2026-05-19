import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { RoutineCard } from "@/components/RoutineCard";
import { Dumbbell } from "@/components/icons";
import { Screen, Button, Card, toastError } from "@/components/ui";
import { getRoutine, listRoutines, startSession, type Routine } from "@/lib/api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function WorkoutsScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const load = useCallback(async () => {
    try {
      setRoutines(await listRoutines());
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const runRoutine = async (id: string) => {
    try {
      const routine = await getRoutine(id);
      if (!routine.exercises?.length) {
        toastError("Add exercises to this routine before starting.");
        return;
      }
      const session = await startSession(id);
      router.push({ pathname: "/session/[id]", params: { id: session.id, routineId: id } });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  };

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
            Routines you can run anytime.
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
            Swipe through exercises and save your first plan. You can start a session when you are ready.
          </Text>
          <View style={{ marginTop: spacing.xl, alignSelf: "stretch" }}>
            <Button
              label="New routine"
              onPress={() => router.push("/routine/new")}
            />
          </View>
        </Card>
      ) : (
        <View style={{ marginTop: spacing.xl }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: "600",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: spacing.md,
            }}
          >
            Your routines
          </Text>
          {routines.map((r) => (
            <RoutineCard
              key={r.id}
              routine={r}
              onOpen={() => router.push(`/routine/${r.id}`)}
              onStart={() => runRoutine(r.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
