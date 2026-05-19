import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ProfileIdentity } from "@/components/ProfileIdentity";
import { Screen, Button, Input, OptionCard, Card, toastError, toastSuccess } from "@/components/ui";
import { getProfile, normalizeTrial, updateProfile } from "@/lib/api";
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
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const setSession = useStore((s) => s.setSession);

  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
      getProfile()
        .then((p) => {
          setProfile(p);
          hydrate(p);
        })
        .catch((e) => {
          console.error(e);
          toastError((e as Error).message);
        });
    }, [hydrate, setProfile])
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
    if (!w || w <= 0) {
      toastError("Enter a valid weight.");
      return;
    }
    if (!h || h <= 0) {
      toastError("Enter a valid height.");
      return;
    }
    if (!a || a < 13 || a > 120) {
      toastError("Enter an age between 13 and 120.");
      return;
    }

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

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
    } catch {
      toastError("Account deletion requires a Supabase edge function. Contact support.");
      return;
    }
    await signOut();
  };

  if (!profile) {
    return (
      <Screen scroll>
        <Text style={styles.pageTitle}>Profile</Text>
        <Text style={{ color: colors.textMuted, marginTop: 16 }}>Loading profile…</Text>
      </Screen>
    );
  }

  const trial = normalizeTrial(profile.trial);

  return (
    <Screen scroll>
      <Text style={styles.pageTitle}>Profile</Text>
      <Text style={styles.tagline}>This is your space.</Text>

      <ProfileIdentity profile={profile} />

      <Text style={styles.sectionTitle}>Free trial</Text>
      <Card style={CARD_PAD}>
        {trial.trial_active ? (
          <>
            <Text style={styles.targetCalories}>
              {trial.days_remaining} day{trial.days_remaining === 1 ? "" : "s"} left
            </Text>
            <Text style={styles.targetMacros}>
              Food scans today: {trial.scans_today} / {trial.scans_limit}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 10, lineHeight: 20 }}>
              Your trial includes nutrient scans from photos. Limits reset each day.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.targetCalories}>Trial ended</Text>
            <Text style={styles.targetMacros}>
              Scans used today: {trial.scans_today} / {trial.scans_limit}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 10, lineHeight: 20 }}>
              Full access is coming soon. You can still log meals and workouts. Contact support if you need help.
            </Text>
          </>
        )}
      </Card>

      <Text style={styles.sectionTitle}>Daily targets</Text>
      <Card style={CARD_PAD}>
        <Text style={styles.targetCalories}>{profile.daily_calorie_target.toLocaleString()} cal / day</Text>
        <Text style={styles.targetMacros}>
          Protein {profile.daily_protein_target_g}g · Carbs {profile.daily_carbs_target_g}g · Fat{" "}
          {profile.daily_fat_target_g}g
        </Text>
      </Card>

      <Pressable
        onPress={() => setEditOpen((o) => !o)}
        accessibilityRole="button"
        style={styles.editHeader}
      >
        <Text style={styles.editHeaderTitle}>Edit your details</Text>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{editOpen ? "▲" : "▼"}</Text>
      </Pressable>

      {editOpen ? (
        <Card style={[CARD_PAD, { marginTop: 0 }]}>
          {targetsChanged && preview ? (
            <Text style={{ color: colors.spark, marginBottom: 16, fontSize: 13 }}>
              After save: ~{preview.daily_calorie_target.toLocaleString()} cal/day · P{" "}
              {preview.daily_protein_target_g}g
            </Text>
          ) : null}

          <Text style={styles.fieldSection}>Units</Text>
          <OptionCard label="Metric (kg, cm)" selected={units === "metric"} onPress={() => onUnitsChange("metric")} />
          <OptionCard
            label="Imperial (lb, in)"
            selected={units === "imperial"}
            onPress={() => onUnitsChange("imperial")}
          />

          <Text style={styles.fieldSection}>Body</Text>
          <Text style={styles.label}>Weight ({units === "metric" ? "kg" : "lb"})</Text>
          <Input
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder={units === "metric" ? "70" : "155"}
            centered={false}
          />
          <Text style={styles.label}>Height ({units === "metric" ? "cm" : "in"})</Text>
          <Input
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder={units === "metric" ? "175" : "69"}
            centered={false}
          />
          <Text style={styles.label}>Age</Text>
          <Input value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="30" centered={false} />

          <Text style={styles.label}>Sex</Text>
          <OptionCard label="Male" selected={sex === "male"} onPress={() => setSex("male")} />
          <OptionCard label="Female" selected={sex === "female"} onPress={() => setSex("female")} />

          <Text style={styles.fieldSection}>Activity</Text>
          {ACTIVITY_OPTIONS.map(({ key, label }) => (
            <OptionCard key={key} label={label} selected={activity === key} onPress={() => setActivity(key)} />
          ))}

          <Text style={styles.fieldSection}>Goal</Text>
          <OptionCard label="Lose weight" selected={goal === "lose"} onPress={() => setGoal("lose")} />
          <OptionCard label="Maintain" selected={goal === "maintain"} onPress={() => setGoal("maintain")} />
          <OptionCard label="Gain weight" selected={goal === "gain"} onPress={() => setGoal("gain")} />

          <View style={{ marginTop: 24 }}>
            <Button label="Save changes" onPress={save} loading={loading} />
          </View>
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>AI & food scans</Text>
      <Pressable
        onPress={() => router.push("/ai-info")}
        accessibilityRole="button"
        style={styles.aiLinkRow}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>How scanning works</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
            Accuracy, your stats, and what to expect from AI estimates
          </Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
      </Pressable>

      <Text style={{ ...styles.sectionTitle, marginTop: 32 }}>Account</Text>
      <Button label="Sign out" variant="secondary" onPress={signOut} />
      <View style={{ marginTop: 12 }}>
        <Button label="Delete account" variant="ghost" onPress={deleteAccount} />
      </View>
    </Screen>
  );
}

const styles = {
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700" as const,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 8,
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
