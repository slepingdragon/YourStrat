import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { Button, toastError } from "@/components/ui";
import { startSession, type Routine, type TodaySnapshot } from "@/lib/api";
import { pickNextAction } from "@/lib/nextAction";
import { useStore } from "@/lib/store";

type Props = {
  today: TodaySnapshot | null;
  routines: Routine[] | null;
};

export function NextActionButton({ today, routines }: Props) {
  const router = useRouter();
  const setActiveSession = useStore((s) => s.setActiveSession);
  const [busy, setBusy] = useState(false);
  const action = pickNextAction(today, routines, new Date());

  const onPress = useCallback(async () => {
    if (busy) return;
    if (action.kind === "navigate") {
      if (action.pathname === "/session/[id]") {
        // Resume the in-flight session via the Workouts-tab takeover (W-C2).
        setActiveSession({ id: action.params.id, routineId: action.params.routineId ?? null });
        router.push("/workouts");
      } else {
        router.push(action.pathname);
      }
      return;
    }
    setBusy(true);
    try {
      const session = await startSession(action.routineId);
      setActiveSession({ id: session.id, routineId: action.routineId });
      router.push("/workouts");
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [action, busy, router, setActiveSession]);

  return <Button label={action.label} onPress={onPress} loading={busy} />;
}
