import { useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Screen, Button, toastError } from "@/components/ui";
import { scanMeal } from "@/lib/api";
import { colors } from "@/theme/colors";

const isWeb = Platform.OS === "web";

export default function ScanScreen() {
  const focused = useIsFocused();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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
    <Screen padding={false}>
      <View style={{ flex: 1 }}>
        {focused ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.surface }} />
        )}
        <View style={{ padding: 24, gap: 12 }}>
          <Button label="Capture" onPress={capture} loading={loading} />
          <Button label="Photo library" variant="secondary" onPress={pickLibrary} disabled={loading} />
        </View>
      </View>
    </Screen>
  );
}
