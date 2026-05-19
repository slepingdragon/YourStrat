import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/components/ui";
import { normalizeTrial, type TrialStatus } from "@/lib/api";
import { colors } from "@/theme/colors";

const DISMISS_PREFIX = "yourstrat_trial_banner_dismissed_";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dismissStorageKey() {
  return `${DISMISS_PREFIX}${todayKey()}`;
}

type Props = {
  trial: TrialStatus | null | undefined;
};

export function TrialBanner({ trial: trialProp }: Props) {
  const trial = normalizeTrial(trialProp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trial.trial_active) {
      setVisible(false);
      return;
    }
    if (trial.days_remaining <= 3) {
      setVisible(true);
      return;
    }
    AsyncStorage.getItem(dismissStorageKey()).then((v) => {
      setVisible(v !== "1");
    });
  }, [trial]);

  const dismiss = async () => {
    await AsyncStorage.setItem(dismissStorageKey(), "1");
    setVisible(false);
  };

  if (!trialProp || !visible) {
    return null;
  }

  const urgent = trial.trial_active && trial.days_remaining <= 3;
  const ended = !trial.trial_active;

  let title = "Free trial";
  let body: string;
  if (ended) {
    title = "Trial ended";
    body = "Food scans are paused for now. You can still log meals manually and track workouts.";
  } else if (urgent) {
    body = `${trial.days_remaining} day${trial.days_remaining === 1 ? "" : "s"} left in your trial · ${trial.scans_today}/${trial.scans_limit} food scans used today`;
  } else {
    body = `${trial.days_remaining} days left · up to ${trial.scans_limit} food scans per day during your trial (${trial.scans_today} used today)`;
  }

  return (
    <Card style={{ marginBottom: 16, width: "100%", maxWidth: 400, alignSelf: "center" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: urgent ? colors.spark : colors.textPrimary, fontWeight: "600", fontSize: 15 }}>
            {title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{body}</Text>
        </View>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss trial reminder"
          hitSlop={8}
        >
          <Text style={{ color: colors.textMuted, fontSize: 18, lineHeight: 20 }}>×</Text>
        </Pressable>
      </View>
    </Card>
  );
}
