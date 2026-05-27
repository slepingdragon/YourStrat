import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { Button, toastError } from "@/components/ui";
import { startSession, type Routine, type TodaySnapshot } from "@/lib/api";
import { pickNextAction } from "@/lib/nextAction";
import { useT } from "@/lib/i18n";

type Props = {
  today: TodaySnapshot | null;
  routines: Routine[] | null;
};

export function NextActionButton({ today, routines }: Props) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const action = pickNextAction(today, routines, new Date(), t);

  const onPress = useCallback(async () => {
    if (busy) return;
    if (action.kind === "navigate") {
      if (action.pathname === "/session/[id]") {
        router.push({ pathname: action.pathname, params: action.params });
      } else {
        router.push(action.pathname);
      }
      return;
    }
    setBusy(true);
    try {
      const session = await startSession(action.routineId);
      router.push({ pathname: "/session/[id]", params: { id: session.id, routineId: action.routineId } });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [action, busy, router]);

  return <Button label={action.label} onPress={onPress} loading={busy} />;
}
