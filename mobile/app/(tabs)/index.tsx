import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { TodayDashboard } from "@/components/TodayDashboard";
import { TrialBanner } from "@/components/TrialBanner";
import { Screen, toastError } from "@/components/ui";
import { getToday } from "@/lib/api";
import { targetsFromProfile } from "@/lib/nutritionTargets";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

export default function TodayScreen() {
  const today = useStore((s) => s.today);
  const profile = useStore((s) => s.profile);
  const setToday = useStore((s) => s.setToday);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getToday();
      setToday(data);
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    }
  }, [setToday]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const t = today?.targets ?? profile;
  const nutritionTargets = useMemo(() => targetsFromProfile(t ?? null), [t]);

  return (
    <Screen padding={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 48,
          alignItems: "center",
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />}
      >
        <TrialBanner trial={profile?.trial ?? today?.targets?.trial} />
        <TodayDashboard today={today} profile={profile} nutritionTargets={nutritionTargets} />
      </ScrollView>
    </Screen>
  );
}
