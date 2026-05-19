import { useCallback, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { Screen, Button, Card, toastError } from "@/components/ui";

import { getRoutine, listRoutines, startSession, type Routine } from "@/lib/api";

import { formatScheduledDays } from "@/lib/scheduleDays";

import { colors } from "@/theme/colors";



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

    <Screen scroll>

      <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700" }}>Workouts</Text>

      <Text style={{ color: colors.textSecondary, marginTop: 8, lineHeight: 22 }}>

        Build routines, then start a session when you are ready to train.

      </Text>



      <View style={{ marginTop: 20 }}>

        <Button label="+ New routine" onPress={() => router.push("/routine/new")} />

      </View>



      <View style={{ height: 28 }} />



      {routines.length === 0 ? (

        <Text style={{ color: colors.textMuted, lineHeight: 22 }}>

          No routines yet. Tap New routine to swipe through exercises and build your first plan.

        </Text>

      ) : (

        routines.map((r) => (

          <Card key={r.id} style={{ marginBottom: 12 }}>

            <Pressable onPress={() => router.push(`/routine/${r.id}`)} accessibilityRole="button">

              <Text style={{ color: colors.textPrimary, fontWeight: "600", fontSize: 17 }}>{r.name}</Text>

              {r.scheduled_days?.length ? (

                <Text style={{ color: colors.textSecondary, marginTop: 6 }}>

                  {formatScheduledDays(r.scheduled_days)}

                </Text>

              ) : (

                <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>Tap to view exercises</Text>

              )}

            </Pressable>

            <View style={{ marginTop: 12 }}>

              <Button label="Start" variant="secondary" onPress={() => runRoutine(r.id)} />

            </View>

          </Card>

        ))

      )}

    </Screen>

  );

}

