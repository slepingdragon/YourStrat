import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import type { Profile, TodaySnapshot } from "@/lib/api";
import { pickWatchlistMetric, type WatchlistMetric } from "@/lib/todayInsights";
import { roundG } from "@/lib/targets";
import { useT } from "@/lib/i18n";
import { AnimatedProgressBar } from "@/components/ui";
import { colors } from "@/theme/colors";
import { glassInline } from "@/theme/glass";
import { spacing } from "@/theme/spacing";
import { WorkoutCard } from "./WorkoutCard";

type Props = {
  today: TodaySnapshot;
  profile: Profile | null;
};

function ProteinCard({ today }: { today: TodaySnapshot }) {
  const t = useT();
  const router = useRouter();
  const target = today.targets?.daily_protein_target_g ?? 0;
  const consumed = today.consumed_protein_g ?? 0;
  const ratio = target > 0 ? consumed / target : 0;
  const inProgress = Math.min(1, Math.max(0, ratio));
  const over = ratio > 1;
  const left = Math.max(0, target - consumed);
  const barColor = over ? colors.error : colors.protein;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id: "protein" } })}
      style={({ pressed }) => ({
        width: "100%",
        ...glassInline.card,
        borderRadius: 12,
        padding: 14,
        opacity: pressed ? 0.85 : 1,
        alignItems: "center",
      })}
      accessibilityRole="button"
      accessibilityLabel={t("trio.proteinA11y", { x: roundG(consumed), y: roundG(target) })}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "600",
          marginBottom: spacing.xs,
          textAlign: "center",
          width: "100%",
        }}
      >
        {t("metric.protein")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
        <Text
          style={{
            color: over ? colors.error : colors.textPrimary,
            fontSize: 22,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            textAlign: "center",
          }}
        >
          {roundG(consumed)}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            fontVariant: ["tabular-nums"],
            textAlign: "center",
          }}
        >
          {t("trio.ofTarget", { x: roundG(target) })}
        </Text>
      </View>
      <AnimatedProgressBar progress={inProgress} color={barColor} style={{ marginTop: spacing.sm + 2, width: "100%" }} />
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          marginTop: 6,
          fontVariant: ["tabular-nums"],
          textAlign: "center",
          width: "100%",
        }}
      >
        {over ? t("trio.gOver", { x: roundG(consumed - target) }) : t("trio.gToGo", { x: roundG(left) })}
      </Text>
    </Pressable>
  );
}

function WatchlistCardView({ metric }: { metric: WatchlistMetric }) {
  const t = useT();
  const router = useRouter();
  const color = metric.tone === "error" ? colors.error : colors.warning;
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/nutrition/metric/[id]", params: { id: metric.id } })}
      style={({ pressed }) => ({
        width: "100%",
        ...glassInline.card,
        borderRadius: 12,
        padding: 14,
        opacity: pressed ? 0.85 : 1,
        alignItems: "center",
      })}
      accessibilityRole="button"
      accessibilityLabel={t("trio.watchlistA11y", { headline: metric.headline, sub: metric.sub })}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "600",
          marginBottom: spacing.xs,
          textAlign: "center",
          width: "100%",
        }}
      >
        {t("trio.watchlist")}
      </Text>
      <Text style={{ color, fontSize: 16, fontWeight: "700", textAlign: "center", width: "100%" }}>{metric.headline}</Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          marginTop: 4,
          fontVariant: ["tabular-nums"],
          textAlign: "center",
          width: "100%",
        }}
      >
        {metric.sub}
      </Text>
    </Pressable>
  );
}

export function TodayTrioCards({ today, profile }: Props) {
  const t = useT();
  const watchlist = pickWatchlistMetric(today, profile, t);

  return (
    <Animated.View entering={FadeIn.duration(400).delay(100)} style={{ width: "100%", gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ProteinCard today={today} />
        </View>
        <View style={{ flex: 1 }}>
          <WorkoutCard today={today} />
        </View>
      </View>
      {watchlist ? <WatchlistCardView metric={watchlist} /> : null}
    </Animated.View>
  );
}
