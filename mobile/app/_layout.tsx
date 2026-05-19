import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastHost } from "@/components/ui";
import { getProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const session = useStore((s) => s.session);
  const profile = useStore((s) => s.profile);
  const setSession = useStore((s) => s.setSession);
  const setProfile = useStore((s) => s.setProfile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileResolved(false);
      return;
    }
    setProfileResolved(false);
    getProfile()
      .then((p) => {
        setProfile(p);
        setProfileResolved(true);
      })
      .catch((e) => {
        const msg = (e as Error).message ?? "";
        console.error(e);
        if (/profile not found/i.test(msg)) {
          setProfile(null);
          setProfileResolved(true);
        }
      });
  }, [session, setProfile]);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === "(auth)";
    const authScreen = segments[1] as string | undefined;
    const publicAuthScreens = new Set(["login", "signup", "reset", "reset-confirm"]);
    const onPublicAuth = inAuth && authScreen && publicAuthScreens.has(authScreen);

    if (!session && !onPublicAuth) {
      router.replace("/(auth)/login");
      return;
    }
    if (session && profileResolved && !profile && authScreen !== "onboarding") {
      router.replace("/(auth)/onboarding");
      return;
    }
    if (session && profile && inAuth) {
      router.replace("/(tabs)");
    }
  }, [ready, session, profile, profileResolved, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#08080B" } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan-result" />
        <Stack.Screen name="ai-info" />
        <Stack.Screen name="meal/[id]" />
        <Stack.Screen name="nutrition/metric/[id]" />
        <Stack.Screen name="nutrition/day/[date]" />
        <Stack.Screen name="routine/new" />
        <Stack.Screen name="routine/[id]" />
        <Stack.Screen name="session/[id]/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="session/[id]/summary" />
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}
