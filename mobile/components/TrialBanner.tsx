import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/components/ui";
import { X } from "@/components/icons";
import { normalizeTrial, type TrialStatus } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const DISMISS_KEY = "yourstrat_trial_banner_dismissed_on";
const LEGACY_DISMISS_PREFIX = "yourstrat_trial_banner_dismissed_";

// In-memory, app-session scope (resets on relaunch). Once dismissed this session
// the notice never re-nags — including the urgent ≤3-day case (4.8 AC2). The
// daily key below additionally throttles the non-urgent case across app opens.
let dismissedThisSession = false;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function cleanupLegacyKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stale = keys.filter(
      (k) => k.startsWith(LEGACY_DISMISS_PREFIX) && k !== DISMISS_KEY
    );
    if (stale.length) await AsyncStorage.multiRemove(stale);
  } catch {
    /* ignore */
  }
}

type Props = {
  trial: TrialStatus | null | undefined;
};

export function TrialBanner({ trial: trialProp }: Props) {
  const router = useRouter();
  const t = useT();
  const trial = normalizeTrial(trialProp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trial.is_admin || !trial.trial_active || dismissedThisSession) {
      setVisible(false);
      return;
    }
    if (trial.days_remaining <= 3) {
      // Urgent: shows unless dismissed this session (handled above) — AC2.
      setVisible(true);
      return;
    }
    AsyncStorage.getItem(DISMISS_KEY).then((dismissedOn) => {
      setVisible(dismissedOn !== todayKey());
    });
    void cleanupLegacyKeys();
  }, [trial]);

  const dismiss = async () => {
    dismissedThisSession = true;
    await AsyncStorage.setItem(DISMISS_KEY, todayKey());
    setVisible(false);
  };

  const openTrialStatus = () => router.push("/profile");

  if (!trialProp || !visible) {
    return null;
  }

  const urgent = trial.trial_active && trial.days_remaining <= 3;
  const ended = !trial.trial_active;

  const scansLine = t("trial.scansUsed", { used: trial.scans_today, limit: trial.scans_limit });
  let title = t("trial.free");
  let body: string;
  if (ended) {
    title = t("trial.ended");
    body = t("trial.endedBody");
  } else if (urgent) {
    title =
      trial.days_remaining <= 0
        ? t("trial.endsToday")
        : trial.days_remaining === 1
          ? t("trial.endsTomorrow")
          : t("trial.daysLeft", { days: trial.days_remaining });
    body = t("trial.urgentBody", { scans: scansLine });
  } else {
    body = t("trial.activeBody", {
      days: trial.days_remaining,
      limit: trial.scans_limit,
      used: trial.scans_today,
    });
  }

  return (
    <Card
      style={{
        marginBottom: 16,
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
        borderColor: urgent ? colors.urgent : colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
        <Pressable
          onPress={openTrialStatus}
          accessibilityRole="button"
          accessibilityLabel={t("trial.a11y", { title, body })}
          style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: urgent ? colors.urgent : colors.textPrimary, fontWeight: "600", fontSize: 15 }}>
            {title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{body}</Text>
        </Pressable>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={t("trial.dismiss")}
          hitSlop={12}
          style={{ padding: spacing.xs }}
        >
          <X color={colors.textMuted} size={18} />
        </Pressable>
      </View>
    </Card>
  );
}
