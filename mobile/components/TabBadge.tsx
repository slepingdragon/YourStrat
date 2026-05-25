import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

/** Rest-badge label: bare seconds under a minute, m:ss above. */
export function formatRestBadge(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  if (s < 60) return `${s}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Overlay on the Workouts tab icon (W-C2). Reads the global active-session
 * pointer + rest deadline: nothing when no session, a calm dot when active but
 * not resting, a 1Hz countdown pill while a rest timer runs. The 1s interval
 * drives only this tiny label (CLAUDE §3 allows the 1Hz timer tick).
 */
export function TabBadge() {
  const activeSession = useStore((s) => s.activeSession);
  const restEndsAt = useStore((s) => s.restEndsAt);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (restEndsAt == null) {
      setRemaining(0);
      return;
    }
    const tick = () => setRemaining(Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [restEndsAt]);

  if (!activeSession) return null;

  const resting = restEndsAt != null && remaining > 0;

  if (!resting) {
    return (
      <View
        style={{
          position: "absolute",
          top: -2,
          right: -6,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.star,
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        top: -9,
        right: -17,
        minWidth: 26,
        paddingHorizontal: 5,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.star,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.bg, fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {formatRestBadge(remaining)}
      </Text>
    </View>
  );
}
