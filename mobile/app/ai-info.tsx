import { useCallback, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen, BackHeader, Card, toastError } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import { getAiStats, type AiStats } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

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
  const t = useT();
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
      <BackHeader title={t("aiInfo.title")} />

      <Section title={t("aiInfo.howItWorks")}>
        <Text style={styles.body}>
          {t("aiInfo.howItWorksBody")}
        </Text>
      </Section>

      <Section title={t("aiInfo.whatToExpect")}>
        <Text style={styles.body}>
          {t("aiInfo.whatToExpectBody")}
        </Text>
      </Section>

      <Section title={t("aiInfo.yourStats")}>
        {stats ? (
          <View style={{ gap: 10 }}>
            <StatRow label={t("aiInfo.statMealsLogged")} value={String(stats.total_scans)} />
            <StatRow label={t("aiInfo.statLoggedWeek")} value={String(stats.scans_this_week)} />
            <StatRow label={t("aiInfo.statAvgConfidence")} value={formatConfidence(stats.avg_confidence)} />
            <StatRow label={t("aiInfo.statFlaggedLow")} value={String(stats.low_confidence_count)} />
            <Text style={{ ...styles.muted, marginTop: spacing.sm, lineHeight: 20 }}>{stats.accuracy_note}</Text>
          </View>
        ) : (
          <Text style={styles.muted}>{t("aiInfo.loadingStats")}</Text>
        )}
      </Section>

      <Section title={t("aiInfo.theTruth")}>
        <Text style={{ ...styles.body, fontWeight: "600", marginBottom: spacing.sm }}>{t("aiInfo.strengths")}</Text>
        <Bullet>{t("aiInfo.strength1")}</Bullet>
        <Bullet>{t("aiInfo.strength2")}</Bullet>
        <Text style={{ ...styles.body, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.sm }}>{t("aiInfo.limits")}</Text>
        <Bullet>{t("aiInfo.limit1")}</Bullet>
        <Bullet>{t("aiInfo.limit2")}</Bullet>
        <Bullet>{t("aiInfo.limit3")}</Bullet>
        <Text style={{ ...styles.muted, marginTop: spacing.md, lineHeight: 20 }}>
          {t("aiInfo.truthNote")}
        </Text>
      </Section>

      <Section title={t("aiInfo.tips")}>
        <Bullet>{t("aiInfo.tip1")}</Bullet>
        <Bullet>{t("aiInfo.tip2")}</Bullet>
        <Bullet>{t("aiInfo.tip3")}</Bullet>
        <Bullet>{t("aiInfo.tip4")}</Bullet>
      </Section>

      <Section title={t("aiInfo.testingTitle")}>
        <Text style={styles.body}>
          {t("aiInfo.testingBody")}
        </Text>
      </Section>

      <Pressable
        onPress={() => setEduOpen((o) => !o)}
        accessibilityRole="button"
        style={styles.eduHeader}
      >
        <Text style={styles.sectionTitle}>{t("aiInfo.basics")}</Text>
        <View style={{ transform: [{ rotate: eduOpen ? "180deg" : "0deg" }] }}>
          <ChevronDown color={colors.textMuted} size={20} />
        </View>
      </Pressable>

      {eduOpen ? (
        <Card style={[CARD_PAD, { marginTop: 0 }]}>
          <Text style={{ ...styles.body, fontWeight: "600", marginBottom: spacing.xs }}>{t("aiInfo.basicsCalories")}</Text>
          <Text style={styles.body}>
            {t("aiInfo.basicsCaloriesBody")}
          </Text>
          <Text style={{ ...styles.body, fontWeight: "600", marginTop: spacing.lg, marginBottom: spacing.xs }}>{t("aiInfo.basicsProtein")}</Text>
          <Text style={styles.body}>
            {t("aiInfo.basicsProteinBody")}
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
