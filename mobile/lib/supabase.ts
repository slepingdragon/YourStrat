import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import "react-native-url-polyfill/auto";

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

const webStorage =
  Platform.OS === "web" && typeof window !== "undefined"
    ? {
        getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        },
      }
    : AsyncStorage;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env, then restart Expo.",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: webStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Lazy client — only created when env vars are set. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});

/** Open Google OAuth in an in-app browser, then exchange the code for a Supabase session. */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL("/");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("Supabase did not return an auth URL.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    // User dismissed the browser — not an error, just no session.
    return;
  }

  const returnUrl = result.url;
  console.log("[google-oauth] redirect URL:", returnUrl);

  // Parse query string and hash fragment for code / tokens / errors.
  const queryStart = returnUrl.indexOf("?");
  const hashStart = returnUrl.indexOf("#");
  const queryString =
    queryStart >= 0
      ? returnUrl.slice(queryStart + 1, hashStart > queryStart ? hashStart : undefined)
      : "";
  const hashString = hashStart >= 0 ? returnUrl.slice(hashStart + 1) : "";
  const query = new URLSearchParams(queryString);
  const hash = new URLSearchParams(hashString);

  const oauthError = query.get("error") ?? hash.get("error");
  if (oauthError) {
    const desc = query.get("error_description") ?? hash.get("error_description") ?? "";
    throw new Error(`Google OAuth error: ${oauthError}${desc ? ` — ${desc}` : ""}`);
  }

  // Implicit flow: tokens come back in the URL hash.
  const accessToken = hash.get("access_token");
  if (accessToken) {
    const refreshToken = hash.get("refresh_token") ?? "";
    const { error: setErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (setErr) throw setErr;
    return;
  }

  // PKCE flow (default for supabase-js v2): code comes back in query string.
  const code = query.get("code") ?? hash.get("code");
  if (!code) {
    throw new Error(`No auth code or token in redirect: ${returnUrl}`);
  }
  const exchange = await supabase.auth.exchangeCodeForSession(code);
  if (exchange.error) throw exchange.error;
}
