import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { getApiBaseUrl } from "@/lib/api";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

const TOAST_MS_NO_ACTION = 3500;
const TOAST_MS_WITH_ACTION = 6500;

export function ToastHost() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.action ? TOAST_MS_WITH_ACTION : TOAST_MS_NO_ACTION;
    const t = setTimeout(clearToast, ms);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 100,
        left: 24,
        right: 24,
        zIndex: 100,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          maxWidth: 480,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: colors.textPrimary, flex: 1, textAlign: toast.action ? "left" : "center" }}>
          {toast.message}
        </Text>
        {toast.action ? (
          <Pressable
            onPress={() => {
              const { onPress } = toast.action!;
              clearToast();
              onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingHorizontal: 4 })}
          >
            <Text style={{ color: colors.spark, fontWeight: "700" }}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function friendlyError(message: string) {
  // Errors thrown by our apiFetch are prefixed "Failed to fetch:" — those are the only
  // errors we can confidently attribute to the API host.
  const apiFetchMatch = /^Failed to fetch:\s*(.+)/i.exec(message);
  if (apiFetchMatch) {
    let base = "";
    try {
      base = getApiBaseUrl();
    } catch {
      /* ignore */
    }
    const target = base ? ` at ${base}` : "";
    return `Cannot reach the API${target}. Reason: ${apiFetchMatch[1].slice(0, 160)}`;
  }
  // Generic network errors from elsewhere (Supabase auth, third-party SDKs).
  if (/network request failed|failed to fetch|load failed/i.test(message)) {
    return `Network error: ${message.slice(0, 200)}`;
  }
  if (message.length > 280) return "Something went wrong. Try again.";
  return message;
}

export function toastError(message: string, retry?: () => void) {
  console.error(message);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  useStore.getState().showToast({
    message: friendlyError(message),
    action: retry ? { label: "Retry", onPress: retry } : undefined,
  });
}

export function toastSuccess(message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  useStore.getState().showToast({ message });
}
