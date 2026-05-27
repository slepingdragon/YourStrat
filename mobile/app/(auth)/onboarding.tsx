import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, OptionCard, ProgressBar, toastError } from "@/components/ui";
import { isNetworkError, onboard } from "@/lib/api";
import { computeTargets, inToCm, lbsToKg } from "@/lib/targets";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const STEPS = 7;

const ACTIVITY_OPTIONS: [string, string][] = [
  ["sedentary", "activity.sedentary"],
  ["light", "activity.light"],
  ["moderate", "activity.moderate"],
  ["active", "activity.active"],
  ["very_active", "activity.very_active"],
];

export default function OnboardingScreen() {
  const t = useT();
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => {
    if (!sex || !activity || !goal) return null;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    if (!w || !h || !a) return null;
    const weightKg = units === "metric" ? w : lbsToKg(w);
    const heightCm = units === "metric" ? h : inToCm(h);
    return computeTargets(sex, weightKg, heightCm, a, activity, goal);
  }, [units, weight, height, age, sex, activity, goal]);

  const finish = async () => {
    if (!sex || !activity || !goal) {
      toastError(t("onboarding.completeAll"));
      return;
    }
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    if (!w || w <= 0) {
      toastError(t("onboarding.validWeight"));
      return;
    }
    if (!h || h <= 0) {
      toastError(t("onboarding.validHeight"));
      return;
    }
    if (!a || a < 13 || a > 120) {
      toastError(t("onboarding.validAge"));
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toastError(t("onboarding.signInFirst"));
      router.replace("/(auth)/login");
      return;
    }
    setLoading(true);
    try {
      const profile = await onboard({
        units,
        weight_kg: units === "metric" ? w : lbsToKg(w),
        height_cm: units === "metric" ? h : inToCm(h),
        age: a,
        sex,
        activity_level: activity,
        goal,
      });
      setProfile(profile);
      router.replace("/(tabs)");
    } catch (e) {
      console.error(e);
      const msg = isNetworkError(e) || /failed to fetch/i.test((e as Error).message ?? "")
        ? "Cannot reach the API at 127.0.0.1:18000. Start servers: Terminal → Run Build Task, or Ctrl+Shift+P → Tasks: Run Build Task → YourStrat: Mobile Preview, or .\\scripts\\start-dev.ps1 from repo root. Wi‑Fi does not block localhost."
        : (e as Error).message;
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step === 1) {
      const w = parseFloat(weight);
      if (!w || w <= 0) {
        toastError(t("onboarding.validWeight"));
        return;
      }
    }
    if (step === 2) {
      const h = parseFloat(height);
      if (!h || h <= 0) {
        toastError(t("onboarding.validHeight"));
        return;
      }
    }
    if (step === 3) {
      const a = parseInt(age, 10);
      if (!a || a < 13 || a > 120) {
        toastError(t("onboarding.validAge"));
        return;
      }
    }
    if (step === 4 && !sex) {
      toastError(t("onboarding.selectSex"));
      return;
    }
    if (step === 5 && !activity) {
      toastError(t("onboarding.selectActivity"));
      return;
    }
    if (step === 6 && !goal) {
      toastError(t("onboarding.selectGoal"));
      return;
    }
    if (step < STEPS - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Screen scroll>
      <ProgressBar progress={(step + 1) / STEPS} />
      {step === 0 && (
        <>
          <Text style={styles.heading}>{t("profile.units")}</Text>
          <Text style={styles.sub}>{t("onboarding.unitsSub")}</Text>
          <View style={{ gap: spacing.md }}>
            <OptionCard label={t("profile.metric")} selected={units === "metric"} onPress={() => setUnits("metric")} />
            <OptionCard label={t("profile.imperial")} selected={units === "imperial"} onPress={() => setUnits("imperial")} />
          </View>
        </>
      )}
      {step === 1 && (
        <>
          <Text style={styles.heading}>{t("onboarding.weight")}</Text>
          <Text style={styles.sub}>{units === "metric" ? t("onboarding.weightKg") : t("onboarding.weightLb")}</Text>
          <Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder={units === "metric" ? "70" : "155"} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.heading}>{t("onboarding.height")}</Text>
          <Text style={styles.sub}>{units === "metric" ? t("onboarding.heightCm") : t("onboarding.heightIn")}</Text>
          <Input value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder={units === "metric" ? "175" : "69"} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.heading}>{t("profile.age")}</Text>
          <Input value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="30" />
        </>
      )}
      {step === 4 && (
        <>
          <Text style={styles.heading}>{t("profile.sex")}</Text>
          <View style={{ gap: spacing.md }}>
            <OptionCard label={t("profile.male")} selected={sex === "male"} onPress={() => setSex("male")} />
            <OptionCard label={t("profile.female")} selected={sex === "female"} onPress={() => setSex("female")} />
          </View>
        </>
      )}
      {step === 5 && (
        <>
          <Text style={styles.heading}>{t("profile.activity")}</Text>
          <View style={{ gap: spacing.md }}>
            {ACTIVITY_OPTIONS.map(([k, labelKey]) => (
              <OptionCard key={k} label={t(labelKey)} selected={activity === k} onPress={() => setActivity(k)} />
            ))}
          </View>
        </>
      )}
      {step === 6 && (
        <>
          <Text style={styles.heading}>{t("profile.goal")}</Text>
          <View style={{ gap: spacing.md }}>
            <OptionCard label={t("goal.lose")} selected={goal === "lose"} onPress={() => setGoal("lose")} />
            <OptionCard label={t("goal.maintain")} selected={goal === "maintain"} onPress={() => setGoal("maintain")} />
            <OptionCard label={t("goal.gain")} selected={goal === "gain"} onPress={() => setGoal("gain")} />
          </View>
          {preview ? (
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.lg }}>
              {t("onboarding.macroPreview", {
                cal: preview.daily_calorie_target,
                p: preview.daily_protein_target_g,
                c: preview.daily_carbs_target_g,
                f: preview.daily_fat_target_g,
              })}
            </Text>
          ) : null}
        </>
      )}
      <View style={{ flex: 1 }} />
      <Button label={step === STEPS - 1 ? t("onboarding.finish") : t("onboarding.continue")} onPress={next} loading={loading} />
      {step > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <Button label={t("common.back")} variant="ghost" onPress={back} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = {
  heading: { color: colors.textPrimary, fontSize: 32, fontWeight: "700" as const, textAlign: "center" as const },
  sub: { color: colors.textSecondary, textAlign: "center" as const, marginTop: spacing.sm, marginBottom: spacing.xl },
};
