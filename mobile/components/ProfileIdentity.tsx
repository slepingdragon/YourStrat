import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { toastError } from "@/components/ui";
import { Camera } from "@/components/icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import type { Profile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { cmToIn, kgToLbs } from "@/lib/targets";
import { colors } from "@/theme/colors";

export const PROFILE_PHOTO_KEY = "yourstrat_profile_photo";

const AVATAR_SIZE = 120;
const PHOTO_MAX_BYTES = 1_500_000;

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose",
  maintain: "Maintain",
  gain: "Gain",
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  if (parts[0]?.length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (local[0] ?? "?").toUpperCase();
}

function displayWeight(kg: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(kg * 10) / 10) : String(Math.round(kgToLbs(kg) * 10) / 10);
}

function displayHeight(cm: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(cm)) : String(Math.round(cmToIn(cm) * 10) / 10);
}

function formatStatsLine(profile: Profile): string {
  const wUnit = profile.units === "metric" ? "kg" : "lb";
  const hUnit = profile.units === "metric" ? "cm" : "in";
  const w = displayWeight(profile.weight_kg, profile.units);
  const h = displayHeight(profile.height_cm, profile.units);
  return `${w} ${wUnit} · ${h} ${hUnit} · ${profile.age} yr`;
}

type Props = {
  profile: Profile;
};

export function ProfileIdentity({ profile }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const scale = useSharedValue(1);
  const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const loadPhoto = useCallback(async () => {
    const stored = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
    setPhotoUri(stored);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
    loadPhoto();
  }, [loadPhoto]);

  const pickPhoto = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toastError("Photo library access denied. Enable it in Settings to change your avatar.");
        return;
      }
    }
    setPicking(true);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      if (!asset?.base64) {
        toastError("Could not read that image. Try a different one.");
        return;
      }
      const approxBytes = Math.floor((asset.base64.length * 3) / 4);
      if (approxBytes > PHOTO_MAX_BYTES) {
        toastError("Image is too large. Pick a smaller one or crop it down.");
        return;
      }
      const mime = asset.mimeType ?? "image/jpeg";
      const dataUri = `data:${mime};base64,${asset.base64}`;
      await AsyncStorage.setItem(PROFILE_PHOTO_KEY, dataUri);
      setPhotoUri(dataUri);
    } catch (e) {
      console.error(e);
      toastError("Could not save photo. Try again.");
    } finally {
      setPicking(false);
    }
  };

  const initials = email ? initialsFromEmail(email) : "?";
  const goalLabel = GOAL_LABELS[profile.goal] ?? profile.goal;

  return (
    <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
      <AnimatedPressable
        onPress={pickPhoto}
        disabled={picking}
        accessibilityRole="button"
        accessibilityLabel="Change photo"
        accessibilityState={{ disabled: picking }}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 150 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        style={[{ width: AVATAR_SIZE, height: AVATAR_SIZE }, avatarStyle]}
      >
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            overflow: "hidden",
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} resizeMode="cover" />
          ) : (
            <Text style={{ color: colors.textPrimary, fontSize: 40, fontWeight: "700" }}>{initials}</Text>
          )}
          {picking ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(8,8,11,0.45)",
              }}
            >
              <ActivityIndicator color={colors.textPrimary} />
            </View>
          ) : null}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.star,
            borderWidth: 3,
            borderColor: colors.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Camera size={16} color={colors.bg} />
        </View>
      </AnimatedPressable>

      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 20, letterSpacing: 0.3 }}>
        Your profile
      </Text>
      {email ? (
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "600",
            marginTop: 4,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {email}
        </Text>
      ) : null}

      <View
        style={{
          marginTop: 12,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.spark, fontSize: 13, fontWeight: "600" }}>{goalLabel}</Text>
      </View>

      <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 12 }}>{formatStatsLine(profile)}</Text>
    </View>
  );
}
