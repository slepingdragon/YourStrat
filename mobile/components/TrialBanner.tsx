import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/components/ui";
import { normalizeTrial, type TrialStatus } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

const DISMISS_KEY = "yourstrat_trial_banner_dismissed_on";
const LEGACY_DISMISS_PREFIX = "yourstrat_trial_banner_dismissed_";

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
  const t = useT();
  const trial = normalizeTrial(trialProp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trial.is_admin) {
      setVisible(false);
      return;
    }
    if (!trial.trial_active) {
      setVisible(false);
      return;
    }
    if (trial.days_remaining <= 3) {
      setVisible(true);
      return;
    }
    AsyncStorage.getItem(DISMISS_KEY).then((dismissedOn) => {
      setVisible(dismissedOn !== todayKey());
    });
    void cleanupLegacyKeys();
  }, [trial]);

  const dismiss = async () => {
    await AsyncStorage.setItem(DISMISS_KEY, todayKey());
    setVisible(false);
  };

  if (!trialProp || !visible) {
    return null;
  }

  const urgent = trial.trial_active && trial.days_remaining <= 3;
  const ended = !trial.trial_active;

  let title = t("trial.free");
  let body: string;
  if (ended) {
    title = t("trial.ended");
    body = t("trial.endedBody");
  } else if (urgent) {
    const daysPart =
      trial.days_remaining === 1
        ? t("trial.daysLeftOne", { days: trial.days_remaining })
        : t("trial.daysLeft", { days: trial.days_remaining });
    body = `${daysPart} · ${t("trial.scansUsed", { used: trial.scans_today, limit: trial.scans_limit })}`;
  } else {
    body = t("trial.activeBody", { days: trial.days_remaining, limit: trial.scans_limit, used: trial.scans_today });
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: urgent ? colors.urgent : colors.textPrimary, fontWeight: "600", fontSize: 15 }}>
            {urgent ? "⚠ " : ""}{title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{body}</Text>
        </View>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={t("trial.dismissA11y")}
          hitSlop={12}
        >
          <Text style={{ color: colors.textMuted, fontSize: 18, lineHeight: 20 }}>×</Text>
        </Pressable>
      </View>
    </Card>
  );
}
