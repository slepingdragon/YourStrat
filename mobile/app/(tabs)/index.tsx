import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TodayDashboard } from "@/components/TodayDashboard";
import { TrialBanner } from "@/components/TrialBanner";
import { Screen, toastError } from "@/components/ui";
import { getNutritionJournal, getToday, listRoutines } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const TAB_BAR_BODY = 72;

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const session = useStore((s) => s.session);
  const today = useStore((s) => s.today);
  const profile = useStore((s) => s.profile);
  const routines = useStore((s) => s.routines);
  const sparkline = useStore((s) => s.sparkline);
  const setToday = useStore((s) => s.setToday);
  const setRoutines = useStore((s) => s.setRoutines);
  const setSparkline = useStore((s) => s.setSparkline);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const [todayRes, routinesRes, journalRes] = await Promise.allSettled([
      getToday(),
      listRoutines(),
      getNutritionJournal(7),
    ]);
    if (todayRes.status === "fulfilled") {
      setToday(todayRes.value);
    } else {
      console.error(todayRes.reason);
      toastError((todayRes.reason as Error)?.message ?? t("today.couldNotLoad"));
    }
    if (routinesRes.status === "fulfilled") {
      setRoutines(routinesRes.value);
    } else {
      console.error(routinesRes.reason);
    }
    if (journalRes.status === "fulfilled") {
      setSparkline(journalRes.value.days);
    } else {
      console.error(journalRes.reason);
    }
  }, [session, setToday, setRoutines, setSparkline]);

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

  return (
    <Screen padding={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl + TAB_BAR_BODY + insets.bottom,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.star} />}
      >
        <TrialBanner trial={profile?.trial ?? today?.targets?.trial} />
        <TodayDashboard today={today} profile={profile} routines={routines} journalDays={sparkline} />
      </ScrollView>
    </Screen>
  );
}
