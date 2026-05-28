import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Screen, Button, GlassModal, toastError } from "@/components/ui";
import { isApiError, lookupBarcode, scanMeal, type MealItem } from "@/lib/api";
import { normalizeMealItem } from "@/lib/mealNutrition";
import { useScanQueue } from "@/lib/scanQueueStore";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const isWeb = Platform.OS === "web";

function ShutterButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const scale = useSharedValue(1);
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      onPressIn={() => {
        scale.value = withSpring(0.86, { damping: 14, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      accessibilityRole="button"
      accessibilityLabel="Capture photo"
      hitSlop={12}
      style={{
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.95)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <Animated.View
        style={[
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: loading ? "rgba(255,255,255,0.55)" : "white",
          },
          innerStyle,
        ]}
      />
    </Pressable>
  );
}

export default function ScanScreen() {
  const focused = useIsFocused();
  const router = useRouter();
  const t = useT();
  const enqueue = useScanQueue((s) => s.enqueue);
  const resolveScan = useScanQueue((s) => s.resolve);
  const failScan = useScanQueue((s) => s.fail);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  // Guard so a barcode in frame is handled once (onBarcodeScanned fires rapidly).
  const handledBarcode = useRef(false);

  // Re-arm barcode scanning each time the Scan tab regains focus.
  useEffect(() => {
    if (focused) handledBarcode.current = false;
  }, [focused]);

  // One synchronous guard for every scan entry (shutter, library, barcode) so a
  // double-tap or a barcode mid-capture can't fire two scans / lock the UI.
  const busyRef = useRef(false);
  // A barcode match awaiting confirmation: show the name -> Select -> review.
  const [match, setMatch] = useState<{ items: MealItem[]; name: string } | null>(null);

  const dismissMatch = () => {
    setMatch(null);
    handledBarcode.current = false; // re-arm the scanner
  };

  const selectMatch = () => {
    if (!match) return;
    const items = match.items;
    setMatch(null);
    router.push({ pathname: "/scan-result", params: { items: JSON.stringify(items) } });
  };

  const handleBarcode = async ({ data }: { data: string }) => {
    if (busyRef.current || handledBarcode.current || match || !data) return;
    handledBarcode.current = true;
    busyRef.current = true;
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // "it registered"
    try {
      const result = await lookupBarcode(data);
      const items = result.items ?? [];
      setMatch({ items, name: items[0]?.name || t("scan.product") }); // confirmation popup
    } catch (e) {
      console.error(e);
      toastError(
        isApiError(e) && e.status === 404
          ? t("scan.barcodeNotFound")
          : (e as Error).message,
      );
      handledBarcode.current = false; // allow another scan / a photo
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  // Fire a scan in the BACKGROUND: drop a pending tab in the queue immediately,
  // run the network call without blocking the shutter, then fill the tab in when
  // it returns (or mark it failed). Lets the user keep shooting — scans pile up
  // as tabs in the app-wide ScanQueueBar instead of forcing a wait per photo.
  const runScan = (uri: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    enqueue(id, uri);
    scanMeal(uri)
      .then((result) => resolveScan(id, (result.items ?? []).map((it) => normalizeMealItem(it))))
      .catch((e) => {
        console.error(e);
        failScan(id);
        toastError((e as Error).message);
      });
  };

  const capture = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // "captured" — the scan runs in the background
        runScan(photo.uri);
      } else {
        toastError(t("scan.captureFailedLibrary"));
      }
    } catch (e) {
      console.error(e);
      toastError(t("scan.captureFailed"));
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const pickLibrary = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (!res.canceled && res.assets[0]?.uri) runScan(res.assets[0].uri);
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  if (isWeb) {
    return (
      <Screen>
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: spacing.sm }}>{t("scan.webTitle")}</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
          {t("scan.webSub")}
        </Text>
        <Button label={t("scan.choosePhoto")} onPress={pickLibrary} loading={loading} />
      </Screen>
    );
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <Text style={{ color: colors.textPrimary, textAlign: "center", marginTop: spacing.xxxl }}>{t("scan.cameraNeeded")}</Text>
        <View style={{ marginTop: 24 }}>
          <Button label={t("scan.allowCamera")} onPress={requestPermission} />
          <View style={{ marginTop: 12 }}>
            <Button label={t("scan.photoLibrary")} variant="secondary" onPress={pickLibrary} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false} edges={["top"]}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {focused ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
            onBarcodeScanned={handleBarcode}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.surface }} />
        )}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            bottom: 28,
            left: 0,
            right: 0,
            alignItems: "center",
            gap: 14,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 12,
              fontWeight: "600",
              opacity: loading ? 0.4 : 0.8,
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {t("scan.hint")}
          </Text>
          <ShutterButton onPress={capture} loading={loading} />
          <Pressable onPress={pickLibrary} disabled={loading} hitSlop={12} accessibilityRole="button">
            <Text
              style={{
                color: "white",
                fontSize: 13,
                fontWeight: "600",
                letterSpacing: 0.3,
                opacity: loading ? 0.4 : 0.85,
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {t("scan.photoLibrary")}
            </Text>
          </Pressable>
        </View>
      </View>

      <GlassModal visible={!!match} onClose={dismissMatch}>
        <View>
          <Text style={{ color: colors.success, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" }}>
            {t("scan.foundFree")}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: spacing.xs }} numberOfLines={3}>
            {match?.name}
          </Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Button label={t("scan.select")} onPress={selectMatch} />
          <Button label={t("scan.scanAgain")} variant="ghost" onPress={dismissMatch} />
        </View>
      </GlassModal>
    </Screen>
  );
}
