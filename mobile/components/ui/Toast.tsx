import { useEffect } from "react";
import { Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

export function ToastHost() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="none"
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
        }}
      >
        <Text style={{ color: colors.textPrimary, textAlign: "center" }}>{toast}</Text>
      </View>
    </View>
  );
}

function friendlyError(message: string) {
  if (/network request failed|failed to fetch|load failed/i.test(message)) {
    return "Cannot reach the server. Start the backend on port 8000.";
  }
  if (message.length > 120) return "Something went wrong. Try again.";
  return message;
}

export function toastError(message: string) {
  console.error(message);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  useStore.getState().showToast(friendlyError(message));
}

export function toastSuccess(message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  useStore.getState().showToast(message);
}
