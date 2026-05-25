import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Screen, Button, toastError, toastSuccess } from "@/components/ui";
import { isApiError, lookupBarcode, scanMeal } from "@/lib/api";
import { colors } from "@/theme/colors";

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
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  // Guard so a barcode in frame is handled once (onBarcodeScanned fires rapidly).
  const handledBarcode = useRef(false);

  // Re-arm barcode scanning each time the Scan tab regains focus.
  useEffect(() => {
    if (focused) handledBarcode.current = false;
  }, [focused]);

  const handleBarcode = async ({ data }: { data: string }) => {
    if (loading || handledBarcode.current || !data) return;
    handledBarcode.current = true;
    setLoading(true);
    // Confirm to the user that a barcode registered (it's otherwise invisible),
    // and that this lookup is free.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toastSuccess("Barcode scanned — free lookup");
    try {
      const result = await lookupBarcode(data);
      router.push({ pathname: "/scan-result", params: { items: JSON.stringify(result.items ?? []) } });
    } catch (e) {
      console.error(e);
      if (isApiError(e) && e.status === 404) {
        toastError("Not in the food database — snap a photo of the food instead.");
      } else {
        toastError((e as Error).message);
      }
      handledBarcode.current = false; // allow another attempt
    } finally {
      setLoading(false);
    }
  };

  const handleUri = async (uri: string) => {
    setLoading(true);
    try {
      const result = await scanMeal(uri);
      const items = result.items ?? [];
      router.push({
        pathname: "/scan-result",
        params: { items: JSON.stringify(items), photoUri: uri },
      });
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const capture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      await handleUri(photo.uri);
    } else {
      toastError("Could not capture photo. Try again or use the photo library.");
    }
  };

  const pickLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!res.canceled && res.assets[0]?.uri) await handleUri(res.assets[0].uri);
  };

  if (isWeb) {
    return (
      <Screen>
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Scan meal</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 24 }}>
          On web, choose a photo from your computer.
        </Text>
        <Button label="Choose photo" onPress={pickLibrary} loading={loading} />
      </Screen>
    );
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <Text style={{ color: colors.textPrimary, textAlign: "center", marginTop: 48 }}>Camera access needed to scan meals.</Text>
        <View style={{ marginTop: 24 }}>
          <Button label="Allow camera" onPress={requestPermission} />
          <View style={{ marginTop: 12 }}>
            <Button label="Photo library" variant="secondary" onPress={pickLibrary} />
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
            Point at a barcode to auto-scan (free) · or photo a meal
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
              Photo library
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
