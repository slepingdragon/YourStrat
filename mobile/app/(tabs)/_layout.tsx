import { useEffect, useRef, type ReactNode } from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { AppTabBar } from "@/components/AppTabBar";
import { Book, Camera, Dumbbell, Profile, StarTab } from "@/components/icons";
import { ScanQueueBar } from "@/components/scan/ScanQueueBar";
import { TabBadge } from "@/components/TabBadge";
import { getActiveSession } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

// Springy "pop": the active icon springs to full size with a slight overshoot
// (the "pop" half of pop + gliding indicator). The gliding indicator + the
// selection haptic live in AppTabBar. A deliberate, owner-approved playful
// departure from LAW-3's "weighted, never bouncy" — scoped to the tab chrome.
// reduceMotion: Never → this gentle micro-interaction plays for everyone, so
// users with the OS "reduce motion" setting on still get the feedback (they'd
// otherwise see it snap). Safe: it's a tiny scale, not large/vestibular motion.
const POP_SPRING = { damping: 10, stiffness: 220, mass: 0.6, reduceMotion: ReduceMotion.Never };

function AnimatedTabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, POP_SPRING);
  }, [focused, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function TabsLayout() {
  const t = useT();
  const session = useStore((s) => s.session);
  const activeSession = useStore((s) => s.activeSession);
  const setActiveSession = useStore((s) => s.setActiveSession);
  const restored = useRef(false);

  // Cold-start restore (W-C2): once authed, if nothing is in memory, ask the
  // server for an unfinished session and re-point the takeover at it.
  useEffect(() => {
    if (restored.current || !session) return;
    if (activeSession) {
      restored.current = true;
      return;
    }
    restored.current = true;
    getActiveSession()
      .then((s) => {
        if (s) setActiveSession({ id: s.id, routineId: s.routine_id });
      })
      .catch((e) => {
        // Best-effort restore. A 404 (backend predates GET /sessions/active) or
        // offline must not red-screen the app — log quietly, don't throw.
        console.log("[active-session] cold-start restore skipped:", (e as Error)?.message ?? e);
      });
  }, [session, activeSession, setActiveSession]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.today"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <StarTab color={color} size={24} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: t("tabs.workouts"),
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
              <AnimatedTabIcon focused={focused}>
                <Dumbbell color={color} size={24} />
              </AnimatedTabIcon>
              <TabBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.star,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                marginTop: 0,
              }}
            >
              <Camera color={colors.bg} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t("tabs.nutrition"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Book color={color} size={24} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Profile color={color} size={24} />
            </AnimatedTabIcon>
          ),
        }}
      />
      </Tabs>
      {/* App-wide stack of unsaved scans — floats above every tab so multi-photo
          scans pile up here instead of blocking the camera (owner-approved
          cross-tab UI, scoped to this transient queue). */}
      <ScanQueueBar />
    </View>
  );
}
