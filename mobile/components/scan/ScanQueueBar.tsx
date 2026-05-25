import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronDown, X } from "@/components/icons";
import { useScanQueue, type QueuedScan, type ScanStatus } from "@/lib/scanQueueStore";
import { formatKcal } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { DiscardMealDialog } from "./DiscardMealDialog";

const CARD_H = 62;
const STACK_OFFSET = 6; // px each peeking card drops below the one in front
const MAX_STACK = 3; // how many layers we render before it's just the count

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Translate = (key: string, params?: Record<string, string | number>) => string;

function subtitle(scan: QueuedScan, t: Translate): string {
  if (scan.status === "pending") return t("queue.analyzing");
  if (scan.status === "error") return t("queue.tapReview");
  if (!scan.items.length) return t("queue.nothingFound");
  return t("queue.kcal", { kcal: formatKcal(scan.calories) });
}

function StatusIndicator({ status }: { status: ScanStatus }) {
  if (status === "pending") return <ActivityIndicator size="small" color={colors.textSecondary} />;
  return (
    <View
      style={{
        width: 9,
        height: 9,
        borderRadius: radius.pill,
        backgroundColor: status === "error" ? colors.urgent : colors.success,
      }}
    />
  );
}

/** Floating, app-wide stack of unsaved scans. Tabs pile up here as photos are
 *  taken so the user can keep shooting; tap to expand the stack, tap a scan to
 *  review/save it, or discard one (always behind a confirmation). */
export function ScanQueueBar() {
  const t = useT();
  const queue = useScanQueue((s) => s.queue);
  const expanded = useScanQueue((s) => s.expanded);
  const setExpanded = useScanQueue((s) => s.setExpanded);
  const remove = useScanQueue((s) => s.remove);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const open = useCallback(
    (scan: QueuedScan) => {
      if (scan.status === "pending") return; // still analyzing — nothing to review yet
      setExpanded(false);
      router.push({ pathname: "/scan-result", params: { queueId: scan.id } });
    },
    [router, setExpanded],
  );

  const confirmTarget = confirmId ? queue.find((q) => q.id === confirmId) : undefined;

  if (!queue.length) return null;

  const front = queue[0];
  const depth = Math.min(queue.length, MAX_STACK);
  const onCollapsedPress = () => {
    if (queue.length === 1 && front.status !== "pending") open(front);
    else setExpanded(true);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {expanded ? (
        <AnimatedPressable
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          onPress={() => setExpanded(false)}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]}
          accessibilityRole="button"
          accessibilityLabel={t("queue.closeList")}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: insets.top + spacing.sm, left: spacing.lg, right: spacing.lg, alignItems: "center" }}
      >
        {expanded ? (
          <Animated.View
            entering={FadeInDown.duration(180)}
            style={{
              width: "100%",
              maxWidth: 460,
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" }}>
                {t("queue.scansCount", { n: queue.length })}
              </Text>
              <Pressable onPress={() => setExpanded(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("queue.collapseList")}>
                <ChevronDown size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: spacing.xs }}>
              {queue.map((scan) => (
                <View
                  key={scan.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Pressable
                    onPress={() => open(scan)}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md }}
                    accessibilityRole="button"
                    accessibilityLabel={t("queue.open", { label: scan.label })}
                  >
                    <StatusIndicator status={scan.status} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}>
                        {scan.label}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                        {subtitle(scan, t)}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmId(scan.id)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={t("queue.discard", { label: scan.label })}
                    style={{ paddingLeft: spacing.md }}
                  >
                    <X size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(180)} style={{ width: "100%", maxWidth: 420 }}>
            <View style={{ height: CARD_H + (depth - 1) * STACK_OFFSET }}>
              {/* decorative peeking cards behind, so the queue reads as a stack */}
              {Array.from({ length: depth - 1 }).map((_, i) => {
                const layer = depth - 1 - i; // deepest painted first, shallowest just under the front card
                return (
                  <View
                    key={layer}
                    style={{
                      position: "absolute",
                      top: layer * STACK_OFFSET,
                      left: layer * 8,
                      right: layer * 8,
                      height: CARD_H,
                      backgroundColor: colors.surface,
                      borderRadius: radius.xl,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: 0.55 - layer * 0.12,
                    }}
                  />
                );
              })}
              {/* front card */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: CARD_H,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  paddingHorizontal: spacing.lg,
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Pressable
                  onPress={onCollapsedPress}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    queue.length === 1
                      ? t("queue.openOne", { label: front.label, sub: subtitle(front, t) })
                      : t("queue.expandMany", { n: queue.length })
                  }
                >
                  <StatusIndicator status={front.status} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
                      {front.label}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                      {subtitle(front, t)}
                    </Text>
                  </View>
                </Pressable>
                {queue.length > 1 ? (
                  <View
                    style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: radius.pill,
                      backgroundColor: colors.star,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: spacing.xs,
                    }}
                  >
                    <Text style={{ color: colors.bg, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{queue.length}</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => setConfirmId(front.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("queue.discard", { label: front.label })}>
                    <X size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      <DiscardMealDialog
        visible={!!confirmId}
        label={confirmTarget?.label}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) remove(confirmId);
          setConfirmId(null);
          if (queue.length <= 1) setExpanded(false);
        }}
      />
    </View>
  );
}
