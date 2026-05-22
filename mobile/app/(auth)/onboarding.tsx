import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Input, OptionCard, ProgressBar, toastError } from "@/components/ui";
import { isNetworkError, onboard } from "@/lib/api";
import { computeTargets, inToCm, lbsToKg } from "@/lib/targets";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { colors } from "@/theme/colors";

const STEPS = 7;

export default function OnboardingScreen() {
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
      toastError("Complete all steps before finishing.");
      return;
    }
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toastError("Sign in first. If you just signed up, confirm your email, then log in.");
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
        toastError("Enter a valid weight.");
        return;
      }
    }
    if (step === 2) {
      const h = parseFloat(height);
      if (!h || h <= 0) {
        toastError("Enter a valid height.");
        return;
      }
    }
    if (step === 3) {
      const a = parseInt(age, 10);
      if (!a || a < 13 || a > 120) {
        toastError("Enter an age between 13 and 120.");
        return;
      }
    }
    if (step === 4 && !sex) {
      toastError("Select sex.");
      return;
    }
    if (step === 5 && !activity) {
      toastError("Select activity level.");
      return;
    }
    if (step === 6 && !goal) {
      toastError("Select a goal.");
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
          <Text style={styles.heading}>Units</Text>
          <Text style={styles.sub}>Choose how you measure.</Text>
          <View style={{ gap: 12 }}>
            <OptionCard label="Metric (kg, cm)" selected={units === "metric"} onPress={() => setUnits("metric")} />
            <OptionCard label="Imperial (lb, in)" selected={units === "imperial"} onPress={() => setUnits("imperial")} />
          </View>
        </>
      )}
      {step === 1 && (
        <>
          <Text style={styles.heading}>Weight</Text>
          <Text style={styles.sub}>{units === "metric" ? "Kilograms" : "Pounds"}</Text>
          <Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder={units === "metric" ? "70" : "155"} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.heading}>Height</Text>
          <Text style={styles.sub}>{units === "metric" ? "Centimeters" : "Inches"}</Text>
          <Input value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder={units === "metric" ? "175" : "69"} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.heading}>Age</Text>
          <Input value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="30" />
        </>
      )}
      {step === 4 && (
        <>
          <Text style={styles.heading}>Sex</Text>
          <View style={{ gap: 12 }}>
            <OptionCard label="Male" selected={sex === "male"} onPress={() => setSex("male")} />
            <OptionCard label="Female" selected={sex === "female"} onPress={() => setSex("female")} />
          </View>
        </>
      )}
      {step === 5 && (
        <>
          <Text style={styles.heading}>Activity</Text>
          <View style={{ gap: 12 }}>
            {[
              ["sedentary", "Sedentary"],
              ["light", "Light"],
              ["moderate", "Moderate"],
              ["active", "Active"],
              ["very_active", "Very active"],
            ].map(([k, label]) => (
              <OptionCard key={k} label={label} selected={activity === k} onPress={() => setActivity(k)} />
            ))}
          </View>
        </>
      )}
      {step === 6 && (
        <>
          <Text style={styles.heading}>Goal</Text>
          <View style={{ gap: 12 }}>
            <OptionCard label="Lose weight" selected={goal === "lose"} onPress={() => setGoal("lose")} />
            <OptionCard label="Maintain" selected={goal === "maintain"} onPress={() => setGoal("maintain")} />
            <OptionCard label="Gain weight" selected={goal === "gain"} onPress={() => setGoal("gain")} />
          </View>
          {preview ? (
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 16 }}>
              {preview.daily_calorie_target} cal/day · P {preview.daily_protein_target_g}g · C{" "}
              {preview.daily_carbs_target_g}g · F {preview.daily_fat_target_g}g
            </Text>
          ) : null}
        </>
      )}
      <View style={{ flex: 1 }} />
      <Button label={step === STEPS - 1 ? "Finish" : "Continue"} onPress={next} loading={loading} />
      {step > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Button label="Back" variant="ghost" onPress={back} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = {
  heading: { color: colors.textPrimary, fontSize: 32, fontWeight: "700" as const, textAlign: "center" as const },
  sub: { color: colors.textSecondary, textAlign: "center" as const, marginTop: 8, marginBottom: 24 },
};
