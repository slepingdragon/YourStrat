import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ProfileIdentity } from "@/components/ProfileIdentity";
import { Check, ChevronDown } from "@/components/icons";
import { Screen, Button, Input, OptionCard, PillRow, Card, Skeleton, toastError, toastSuccess } from "@/components/ui";
import { getAiStats, getProfile, getSessionStats, normalizeTrial, updateProfile, type AiStats, type SessionStats } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { LANGUAGES, useI18n, useT } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { cmToIn, computeTargets, inToCm, kgToLbs, lbsToKg } from "@/lib/targets";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const ACTIVITY_KEYS = ["sedentary", "light", "moderate", "active", "very_active"] as const;

const CARD_PAD = { padding: 24 };

function displayWeight(kg: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(kg * 10) / 10) : String(Math.round(kgToLbs(kg) * 10) / 10);
}

function displayHeight(cm: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(cm)) : String(Math.round(cmToIn(cm) * 10) / 10);
}

export default function ProfileScreen() {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const setLang = useI18n((s) => s.setLang);
  const router = useRouter();
  const session = useStore((s) => s.session);
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const setSession = useStore((s) => s.setSession);

  const [stats, setStats] = useState<SessionStats | null>(null);
  const [aiStats, setAiStats] = useState<AiStats | null>(null);
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const hydrate = useCallback((p: NonNullable<typeof profile>) => {
    setUnits(p.units);
    setWeight(displayWeight(p.weight_kg, p.units));
    setHeight(displayHeight(p.height_cm, p.units));
    setAge(String(p.age));
    setSex(p.sex);
    setActivity(p.activity_level);
    setGoal(p.goal as "lose" | "maintain" | "gain");
  }, []);

  useEffect(() => {
    if (profile) hydrate(profile);
  }, [profile, hydrate]);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getProfile()
        .then((p) => {
          setProfile(p);
          hydrate(p);
        })
        .catch((e) => {
          console.error(e);
          toastError((e as Error).message);
        });
      getSessionStats()
        .then(setStats)
        .catch((e) => {
          console.error(e);
        });
      getAiStats()
        .then(setAiStats)
        .catch((e) => {
          console.error(e);
        });
    }, [session, hydrate, setProfile])
  );

  const preview = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    if (!w || !h || !a) return null;
    const weightKg = units === "metric" ? w : lbsToKg(w);
    const heightCm = units === "metric" ? h : inToCm(h);
    return computeTargets(sex, weightKg, heightCm, a, activity, goal);
  }, [units, weight, height, age, sex, activity, goal]);

  const targetsChanged =
    preview && profile ? preview.daily_calorie_target !== profile.daily_calorie_target : false;

  const onUnitsChange = (next: "metric" | "imperial") => {
    if (next === units) return;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w && h) {
      const weightKg = units === "metric" ? w : lbsToKg(w);
      const heightCm = units === "metric" ? h : inToCm(h);
      setWeight(displayWeight(weightKg, next));
      setHeight(displayHeight(heightCm, next));
    }
    setUnits(next);
  };

  const save = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    const wErr = !w || w <= 0 ? "Enter a valid weight." : null;
    const hErr = !h || h <= 0 ? "Enter a valid height." : null;
    const aErr = !a || a < 13 || a > 120 ? "Enter an age between 13 and 120." : null;
    setWeightError(wErr);
    setHeightError(hErr);
    setAgeError(aErr);
    if (wErr || hErr || aErr) return;

    setLoading(true);
    try {
      const p = await updateProfile({
        units,
        weight_kg: units === "metric" ? w : lbsToKg(w),
        height_cm: units === "metric" ? h : inToCm(h),
        age: a,
        sex,
        activity_level: activity,
        goal,
      });
      setProfile(p);
      hydrate(p);
      toastSuccess(t("profile.updated"));
    } catch (e) {
      console.error(e);
      toastError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    router.replace("/(auth)/login");
  };

  const performDelete = async () => {
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
    } catch (e) {
      console.error(e);
      toastError(t("profile.deleteError"));
      return;
    }
    await signOut();
  };

  const deleteAccount = () => {
    const message = t("profile.deleteMessage");
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${t("profile.deleteTitle")}\n\n${message}`)) {
        void performDelete();
      }
      return;
    }
    Alert.alert(t("profile.deleteTitle"), message, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.deleteAccount"), style: "destructive", onPress: () => void performDelete() },
    ]);
  };

  if (!profile) {
    return (
      <Screen scroll>
        <Text style={styles.pageTitle}>{t("profile.title")}</Text>
        <View style={{ height: 24 }} />
        <View style={{ alignItems: "center" }}>
          <Skeleton width={120} height={120} radius={60} />
        </View>
        <View style={{ height: 16 }} />
        <Skeleton width="40%" height={14} radius={4} style={{ alignSelf: "center" }} />
        <View style={{ height: 32 }} />
        <Skeleton height={100} radius={16} />
        <View style={{ height: 16 }} />
        <Skeleton height={80} radius={16} />
      </Screen>
    );
  }

  const trial = normalizeTrial(profile.trial);
  const trialLine = trial.is_admin
    ? t("profile.trialAdmin")
    : trial.trial_active
      ? t(trial.days_remaining === 1 ? "profile.trialActiveOne" : "profile.trialActiveOther", {
          days: trial.days_remaining,
          today: trial.scans_today,
          limit: trial.scans_limit,
        })
      : t("profile.trialEnded", { today: trial.scans_today, limit: trial.scans_limit });

  return (
    <Screen scroll>
      <Text style={styles.pageTitle}>{t("profile.title")}</Text>

      <ProfileIdentity profile={profile} />

      {/* P-S1 — lifetime kcal-burned trophy hero */}
      <View style={styles.hero}>
        <Text allowFontScaling={false} style={styles.heroNumber}>
          {formatKcal(stats?.lifetime_calories_burned ?? 0)}
        </Text>
        <Text style={styles.heroLabel}>{t("profile.burnedAllTime")}</Text>
        {stats && stats.lifetime_sessions > 0 ? (
          <Text style={styles.heroSub}>
            {t(stats.lifetime_sessions === 1 ? "profile.workoutsOne" : "profile.workoutsOther", {
              n: stats.lifetime_sessions,
            })}
            {stats.avg_actual_rpe != null ? t("profile.avgEffort", { r: stats.avg_actual_rpe }) : ""}
          </Text>
        ) : (
          <Text style={styles.heroSub}>{t("profile.burnTallies")}</Text>
        )}
      </View>

      {/* P-C1 — trial status, single line, no card */}
      <Text style={styles.trialLine}>{trialLine}</Text>

      <Pressable
        onPress={() => setEditOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={editOpen ? t("profile.editCollapse") : t("profile.editExpand")}
        accessibilityState={{ expanded: editOpen }}
        style={styles.editHeader}
      >
        <Text style={styles.editHeaderTitle}>{t("profile.editDetails")}</Text>
        <View style={{ transform: [{ rotate: editOpen ? "180deg" : "0deg" }] }}>
          <ChevronDown color={colors.textMuted} size={20} />
        </View>
      </Pressable>

      {editOpen ? (
        <Card style={[CARD_PAD, { marginTop: 0 }]}>
          {targetsChanged && preview ? (
            <Text style={{ color: colors.spark, marginBottom: 16, fontSize: 13 }}>
              {t("profile.afterSave", {
                cal: formatKcal(preview.daily_calorie_target),
                p: preview.daily_protein_target_g,
              })}
            </Text>
          ) : null}

          <Text style={styles.fieldSection}>{t("profile.units")}</Text>
          <View style={{ gap: 12 }}>
            <OptionCard label={t("profile.metric")} selected={units === "metric"} onPress={() => onUnitsChange("metric")} />
            <OptionCard
              label={t("profile.imperial")}
              selected={units === "imperial"}
              onPress={() => onUnitsChange("imperial")}
            />
          </View>

          <Text style={styles.fieldSection}>{t("profile.body")}</Text>
          <Text style={styles.label}>{t("profile.weight", { u: units === "metric" ? "kg" : "lb" })}</Text>
          <Input
            value={weight}
            onChangeText={(v) => {
              setWeight(v);
              if (weightError) setWeightError(null);
            }}
            keyboardType="decimal-pad"
            placeholder={units === "metric" ? "70" : "155"}
            centered={false}
            error={weightError}
          />
          <Text style={styles.label}>{t("profile.height", { u: units === "metric" ? "cm" : "in" })}</Text>
          <Input
            value={height}
            onChangeText={(v) => {
              setHeight(v);
              if (heightError) setHeightError(null);
            }}
            keyboardType="decimal-pad"
            placeholder={units === "metric" ? "175" : "69"}
            centered={false}
            error={heightError}
          />
          <Text style={styles.label}>{t("profile.age")}</Text>
          <Input
            value={age}
            onChangeText={(v) => {
              setAge(v);
              if (ageError) setAgeError(null);
            }}
            keyboardType="number-pad"
            placeholder="30"
            centered={false}
            error={ageError}
          />

          <Text style={styles.label}>{t("profile.sex")}</Text>
          <PillRow
            options={[
              { value: "male", label: t("profile.male") },
              { value: "female", label: t("profile.female") },
            ]}
            value={sex}
            onChange={setSex}
            accessibilityLabel={t("profile.sex")}
          />

          <Text style={styles.fieldSection}>{t("profile.activity")}</Text>
          <View style={{ gap: 12 }}>
            {ACTIVITY_KEYS.map((key) => (
              <OptionCard key={key} label={t("activity." + key)} selected={activity === key} onPress={() => setActivity(key)} />
            ))}
          </View>

          <Text style={styles.fieldSection}>{t("profile.goal")}</Text>
          <PillRow
            options={[
              { value: "lose", label: t("goal.lose") },
              { value: "maintain", label: t("goal.maintain") },
              { value: "gain", label: t("goal.gain") },
            ]}
            value={goal}
            onChange={setGoal}
            accessibilityLabel={t("profile.goal")}
          />

          <View style={{ marginTop: 24 }}>
            <Button label={t("common.saveChanges")} onPress={save} loading={loading} />
          </View>
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>{t("profile.aiSection")}</Text>
      <SettingsGroup>
        {aiStats ? (
          <>
            <SettingsRow label={t("profile.totalScans")} value={String(aiStats.total_scans)} />
            <SettingsRow label={t("profile.thisWeek")} value={String(aiStats.scans_this_week)} />
            <SettingsRow
              label={t("profile.avgConfidence")}
              value={aiStats.avg_confidence != null ? `${Math.round(aiStats.avg_confidence * 100)}%` : "—"}
            />
            <SettingsRow label={t("profile.lowConfidence")} value={String(aiStats.low_confidence_count)} />
          </>
        ) : null}
        <SettingsRow label={t("profile.howScanning")} onPress={() => router.push("/ai-info")} chevron last />
      </SettingsGroup>
      {aiStats?.accuracy_note ? <Text style={styles.caption}>{aiStats.accuracy_note}</Text> : null}

      <Text style={{ ...styles.sectionTitle, marginTop: spacing.xxl }}>{t("profile.language")}</Text>
      <SettingsGroup>
        {LANGUAGES.map((l, i) => (
          <SettingsRow
            key={l.code}
            label={l.native}
            onPress={() => setLang(l.code)}
            selected={lang === l.code}
            last={i === LANGUAGES.length - 1}
          />
        ))}
      </SettingsGroup>

      <Text style={{ ...styles.sectionTitle, marginTop: spacing.xxl }}>{t("profile.account")}</Text>
      <SettingsGroup>
        <SettingsRow label={t("profile.signOut")} onPress={signOut} chevron />
        <SettingsRow label={t("profile.deleteAccount")} onPress={deleteAccount} destructive last />
      </SettingsGroup>
    </Screen>
  );
}

function SettingsGroup({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  destructive,
  chevron,
  selected,
  last,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
  selected?: boolean;
  last?: boolean;
}) {
  const labelColor = destructive ? colors.error : colors.textPrimary;
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ flex: 1, color: labelColor, fontSize: 16, fontWeight: "500" }}>{label}</Text>
      {value != null ? (
        <Text style={{ color: colors.textSecondary, fontSize: 15, fontVariant: ["tabular-nums"] }}>{value}</Text>
      ) : null}
      {chevron ? <Text style={{ color: colors.textMuted, fontSize: 18, marginLeft: 8 }}>›</Text> : null}
      {selected ? <Check color={colors.star} size={20} /> : null}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceElevated : "transparent" })}
    >
      {inner}
    </Pressable>
  );
}

const styles = {
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700" as const,
  },
  hero: {
    alignItems: "center" as const,
    marginTop: 24,
    marginBottom: 16,
  },
  heroNumber: {
    color: colors.textPrimary,
    fontSize: 72,
    lineHeight: 78,
    fontWeight: "800" as const,
    fontVariant: ["tabular-nums"] as ["tabular-nums"],
    letterSpacing: -2,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  heroSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
    fontVariant: ["tabular-nums"] as ["tabular-nums"],
  },
  trialLine: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center" as const,
    fontVariant: ["tabular-nums"] as ["tabular-nums"],
    marginBottom: 4,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: "600" as const,
    fontSize: 17,
    marginTop: 24,
    marginBottom: 12,
  },
  editHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 24,
    marginBottom: 4,
  },
  editHeaderTitle: {
    color: colors.textPrimary,
    fontWeight: "600" as const,
    fontSize: 17,
  },
  targetCalories: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700" as const,
  },
  targetMacros: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  fieldSection: {
    color: colors.textPrimary,
    fontWeight: "600" as const,
    fontSize: 15,
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  aiLinkRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
};
