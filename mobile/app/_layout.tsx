import "../global.css";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SetupEnvScreen } from "@/components/SetupEnvScreen";
import { ToastHost, toastError } from "@/components/ui";
import { getProfile, isNetworkError, isUnauthorized, pingApiHealth } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

const PUBLIC_AUTH_SCREENS = new Set(["login", "signup", "reset", "reset-confirm"]);

/**
 * Segments can lag on first paint; pathname covers /login on web.
 * Also treat an unresolved route (no segments + empty/root pathname) as public
 * so we don't fire "API unreachable" toasts during initial hydration.
 */
function isPublicAuthRoute(segments: string[], pathname: string): boolean {
  if (segments.length === 0 && (pathname === "" || pathname === "/")) return true;
  const inAuth = segments[0] === "(auth)";
  const authScreen = (inAuth ? segments[1] : segments[0]) as string | undefined;
  if (authScreen && PUBLIC_AUTH_SCREENS.has(authScreen)) return true;
  const leaf = pathname.replace(/\/$/, "").split("/").filter(Boolean).at(-1) ?? "";
  return PUBLIC_AUTH_SCREENS.has(leaf);
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const session = useStore((s) => s.session);
  const profile = useStore((s) => s.profile);
  const setSession = useStore((s) => s.setSession);
  const setProfile = useStore((s) => s.setProfile);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
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
    (async () => {
      const onPublicAuth = isPublicAuthRoute(segments, pathname);

      if (Platform.OS === "web" && !onPublicAuth) {
        const apiUp = await pingApiHealth();
        if (!apiUp) {
          toastError("Failed to fetch");
          return;
        }
      }
      try {
        const p = await getProfile();
        setProfile(p);
        setProfileResolved(true);
      } catch (e) {
        const msg = (e as Error).message ?? "";
        console.error(e);
        if (isUnauthorized(e) || /profile not found/i.test(msg)) {
          setProfile(null);
          setProfileResolved(true);
        } else if (isNetworkError(e) && !onPublicAuth) {
          toastError(msg);
        } else {
          setProfileResolved(true);
        }
      }
    })();
  }, [session, setProfile, segments, pathname]);

  useEffect(() => {
    if (toast && isPublicAuthRoute(segments, pathname)) {
      clearToast();
    }
  }, [toast, segments, pathname, clearToast]);

  useEffect(() => {
    if (!isSupabaseConfigured || !ready) return;
    const inAuth = segments[0] === "(auth)";
    const authScreen = segments[1] as string | undefined;
    const onPublicAuth = isPublicAuthRoute(segments, pathname);

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
  }, [ready, session, profile, profileResolved, segments, pathname, router]);

  if (!isSupabaseConfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SetupEnvScreen />
      </GestureHandlerRootView>
    );
  }

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
