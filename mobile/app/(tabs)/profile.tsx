import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ProfileIdentity } from "@/components/ProfileIdentity";
import { ChevronDown } from "@/components/icons";
import { Screen, Button, Input, OptionCard, PillRow, Card, Skeleton, toastError, toastSuccess } from "@/components/ui";
import { getAiStats, getProfile, getSessionStats, normalizeTrial, updateProfile, type AiStats, type SessionStats } from "@/lib/api";
import { formatKcal } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { cmToIn, computeTargets, inToCm, kgToLbs, lbsToKg } from "@/lib/targets";
import { colors } from "@/theme/colors";

const ACTIVITY_OPTIONS: { key: string; label: string }[] = [
  { key: "sedentary", label: "Sedentary" },
  { key: "light", label: "Light" },
  { key: "moderate", label: "Moderate" },
  { key: "active", label: "Active" },
  { key: "very_active", label: "Very active" },
];

const CARD_PAD = { padding: 24 };

function displayWeight(kg: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(kg * 10) / 10) : String(Math.round(kgToLbs(kg) * 10) / 10);
}

function displayHeight(cm: number, units: "metric" | "imperial") {
  return units === "metric" ? String(Math.round(cm)) : String(Math.round(cmToIn(cm) * 10) / 10);
}

export default function ProfileScreen() {
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
      toastSuccess("Profile updated. Targets recalculated.");
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
      toastError("Couldn't delete your account. Check your connection and try again.");
      return;
    }
    await signOut();
  };

  const deleteAccount = () => {
    const message = "This permanently deletes your profile, meals, and workout history. This cannot be undone.";
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`Delete account?\n\n${message}`)) {
        void performDelete();
      }
      return;
    }
    Alert.alert("Delete account?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete account", style: "destructive", onPress: () => void performDelete() },
    ]);
  };

  if (!profile) {
    return (
      <Screen scroll>
        <Text style={styles.pageTitle}>Profile</Text>
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
    ? "Admin · unlimited food scans"
    : trial.trial_active
      ? `${trial.days_remaining} day${trial.days_remaining === 1 ? "" : "s"} left · ${trial.scans_today}/${trial.scans_limit} scans today`
      : `Trial ended · ${trial.scans_today}/${trial.scans_limit} scans today`;

  return (
    <Screen scroll>
      <Text style={styles.pageTitle}>Profile</Text>

      <ProfileIdentity profile={profile} />

      {/* P-S1 — lifetime kcal-burned trophy hero */}
      <View style={styles.hero}>
        <Text allowFontScaling={false} style={styles.heroNumber}>
          {formatKcal(stats?.lifetime_calories_burned ?? 0)}
        </Text>
        <Text style={styles.heroLabel}>calories burned · all-time</Text>
        {stats && stats.lifetime_sessions > 0 ? (
          <Text style={styles.heroSub}>
            {stats.lifetime_sessions} workout{stats.lifetime_sessions === 1 ? "" : "s"}
            {stats.avg_actual_rpe != null ? ` · avg effort ${stats.avg_actual_rpe}/10` : ""}
          </Text>
        ) : (
          <Text style={styles.heroSub}>Your all-time burn tallies here.</Text>
        )}
      </View>

      {/* P-C1 — trial status, single line, no card */}
      <Text style={styles.trialLine}>{trialLine}</Text>

      <Pressable
        onPress={() => setEditOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={editOpen ? "Collapse edit details" : "Expand edit details"}
        accessibilityState={{ expanded: editOpen }}
        style={styles.editHeader}
      >
        <Text style={styles.editHeaderTitle}>Edit your details</Text>
        <View style={{ transform: [{ rotate: editOpen ? "180deg" : "0deg" }] }}>
          <ChevronDown color={colors.textMuted} size={20} />
        </View>
      </Pressable>

      {editOpen ? (
        <Card style={[CARD_PAD, { marginTop: 0 }]}>
          {targetsChanged && preview ? (
            <Text style={{ color: colors.spark, marginBottom: 16, fontSize: 13 }}>
              After save: ~{formatKcal(preview.daily_calorie_target)} cal/day · P{" "}
              {preview.daily_protein_target_g}g
            </Text>
          ) : null}

          <Text style={styles.fieldSection}>Units</Text>
          <View style={{ gap: 12 }}>
            <OptionCard label="Metric (kg, cm)" selected={units === "metric"} onPress={() => onUnitsChange("metric")} />
            <OptionCard
              label="Imperial (lb, in)"
              selected={units === "imperial"}
              onPress={() => onUnitsChange("imperial")}
            />
          </View>

          <Text style={styles.fieldSection}>Body</Text>
          <Text style={styles.label}>Weight ({units === "metric" ? "kg" : "lb"})</Text>
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
          <Text style={styles.label}>Height ({units === "metric" ? "cm" : "in"})</Text>
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
          <Text style={styles.label}>Age</Text>
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

          <Text style={styles.label}>Sex</Text>
          <PillRow
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            value={sex}
            onChange={setSex}
            accessibilityLabel="Sex"
          />

          <Text style={styles.fieldSection}>Activity</Text>
          <View style={{ gap: 12 }}>
            {ACTIVITY_OPTIONS.map(({ key, label }) => (
              <OptionCard key={key} label={label} selected={activity === key} onPress={() => setActivity(key)} />
            ))}
          </View>

          <Text style={styles.fieldSection}>Goal</Text>
          <PillRow
            options={[
              { value: "lose", label: "Lose" },
              { value: "maintain", label: "Maintain" },
              { value: "gain", label: "Gain" },
            ]}
            value={goal}
            onChange={setGoal}
            accessibilityLabel="Goal"
          />

          <View style={{ marginTop: 24 }}>
            <Button label="Save changes" onPress={save} loading={loading} />
          </View>
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>AI & food scans</Text>
      <SettingsGroup>
        {aiStats ? (
          <>
            <SettingsRow label="Total scans" value={String(aiStats.total_scans)} />
            <SettingsRow label="This week" value={String(aiStats.scans_this_week)} />
            <SettingsRow
              label="Avg confidence"
              value={aiStats.avg_confidence != null ? `${Math.round(aiStats.avg_confidence * 100)}%` : "—"}
            />
            <SettingsRow label="Low-confidence scans" value={String(aiStats.low_confidence_count)} />
          </>
        ) : null}
        <SettingsRow label="How scanning works" onPress={() => router.push("/ai-info")} chevron last />
      </SettingsGroup>
      {aiStats?.accuracy_note ? <Text style={styles.caption}>{aiStats.accuracy_note}</Text> : null}

      <Text style={{ ...styles.sectionTitle, marginTop: 32 }}>Account</Text>
      <SettingsGroup>
        <SettingsRow label="Sign out" onPress={signOut} chevron />
        <SettingsRow label="Delete account" onPress={deleteAccount} destructive last />
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
  last,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
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
