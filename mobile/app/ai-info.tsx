import { useCallback, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen, BackHeader, Card, toastError } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import { getAiStats, type AiStats } from "@/lib/api";
import { colors } from "@/theme/colors";

const CARD_PAD = { padding: 20 };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={CARD_PAD}>{children}</Card>
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <Text style={styles.bullet}>
      {"• "}
      {children}
    </Text>
  );
}

function formatConfidence(value: number | null) {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export default function AiInfoScreen() {
  const [stats, setStats] = useState<AiStats | null>(null);
  const [eduOpen, setEduOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAiStats()
        .then(setStats)
        .catch((e) => {
          console.error(e);
          toastError((e as Error).message);
        });
    }, [])
  );

  return (
    <Screen scroll>
      <BackHeader title="AI & food scans" />

      <Section title="How it works">
        <Text style={styles.body}>
          You take a photo of your meal. Our app sends the image to Google Gemini, which estimates each food’s
          calories and macros from what it sees — nothing is read from a barcode unless you check the package
          yourself.
        </Text>
      </Section>

      <Section title="What to expect">
        <Text style={styles.body}>
          This is not a lab test. It works best on clear photos of a single plate with good lighting. For packaged
          foods, use the Nutrition Facts label when you need exact numbers.
        </Text>
      </Section>

      <Section title="Your stats">
        {stats ? (
          <View style={{ gap: 10 }}>
            <StatRow label="Meals logged from scans" value={String(stats.total_scans)} />
            <StatRow label="Logged this week" value={String(stats.scans_this_week)} />
            <StatRow label="Average confidence" value={formatConfidence(stats.avg_confidence)} />
            <StatRow label="Items flagged low confidence" value={String(stats.low_confidence_count)} />
            <Text style={{ ...styles.muted, marginTop: 8, lineHeight: 20 }}>{stats.accuracy_note}</Text>
          </View>
        ) : (
          <Text style={styles.muted}>Loading your scan stats…</Text>
        )}
      </Section>

      <Section title="The truth">
        <Text style={{ ...styles.body, fontWeight: "600", marginBottom: 8 }}>Strengths</Text>
        <Bullet>Fast estimates for home-cooked plates and recognizable portions.</Bullet>
        <Bullet>Editable before you save — fix anything that looks off.</Bullet>
        <Text style={{ ...styles.body, fontWeight: "600", marginTop: 14, marginBottom: 8 }}>Limits</Text>
        <Bullet>Hidden oils, sauces, and mixed dishes are easy to misjudge.</Bullet>
        <Bullet>Packaged foods: often 10–25% off vs the label; verify when it matters.</Bullet>
        <Bullet>Confidence below 70% means the model was unsure — double-check portions.</Bullet>
        <Text style={{ ...styles.muted, marginTop: 12, lineHeight: 20 }}>
          We do not show fake precision. Estimates help you steer your day; labels and scales win when you need
          proof.
        </Text>
      </Section>

      <Section title="Tips for better scans">
        <Bullet>Use bright, even light — avoid heavy shadows.</Bullet>
        <Bullet>Show the full plate; avoid cropping half the meal.</Bullet>
        <Bullet>One meal at a time — fewer mixed bowls per photo.</Bullet>
        <Bullet>Tap numbers on the review screen to correct mistakes before saving.</Bullet>
      </Section>

      <Section title="Testing accuracy yourself">
        <Text style={styles.body}>
          Pick a meal with a Nutrition Facts label or a known recipe. Scan it, then compare calories and protein to
          the label or your recipe math. Small differences are normal; large gaps usually mean portion size was off.
        </Text>
      </Section>

      <Pressable
        onPress={() => setEduOpen((o) => !o)}
        accessibilityRole="button"
        style={styles.eduHeader}
      >
        <Text style={styles.sectionTitle}>Nutrition basics</Text>
        <View style={{ transform: [{ rotate: eduOpen ? "180deg" : "0deg" }] }}>
          <ChevronDown color={colors.textMuted} size={20} />
        </View>
      </Pressable>

      {eduOpen ? (
        <Card style={[CARD_PAD, { marginTop: 0 }]}>
          <Text style={{ ...styles.body, fontWeight: "600", marginBottom: 6 }}>Calories</Text>
          <Text style={styles.body}>
            A calorie measures energy in food. USDA guidelines use about 2,000 kcal per day as a general reference
            for adults; your target in YourStrat is personalized from your body and goal.
          </Text>
          <Text style={{ ...styles.body, fontWeight: "600", marginTop: 16, marginBottom: 6 }}>Protein</Text>
          <Text style={styles.body}>
            Protein provides about 4 kcal per gram and supports muscle repair. Many active adults aim for roughly
            0.7–1.0 g per pound of body weight per day; your daily protein target in the app is a starting point, not
            medical advice.
          </Text>
        </Card>
      ) : null}

      <View style={{ height: 32 }} />
    </Screen>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

const styles = {
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: "600" as const,
    fontSize: 17,
    marginBottom: 12,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  eduHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 24,
    marginBottom: 4,
  },
};
