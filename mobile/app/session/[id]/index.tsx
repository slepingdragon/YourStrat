import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "@/lib/store";

/**
 * Legacy / deep-link shim (W-C2). The live session no longer lives at this
 * full-screen route — it renders inside the Workouts tab so the tab bar + rest
 * badge stay visible. Anyone who still navigates here gets the active-session
 * pointer set and is bounced to the tab. The normal entry points set the
 * pointer directly and never hit this.
 */
export default function SessionRedirect() {
  const { id, routineId } = useLocalSearchParams<{ id: string; routineId?: string }>();
  const router = useRouter();
  const setActiveSession = useStore((s) => s.setActiveSession);

  useEffect(() => {
    if (id) setActiveSession({ id, routineId: routineId ?? null });
    router.replace("/(tabs)/workouts");
  }, [id, routineId, router, setActiveSession]);

  return null;
}
