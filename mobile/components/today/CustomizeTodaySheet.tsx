import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { ChevronDown, Check } from "@/components/icons";
import { Button } from "@/components/ui";
import {
  moveSection,
  type TodayLayout,
  type TodaySectionId,
} from "@/lib/todayLayout";
import { TODAY_GRID_METRICS } from "@/lib/todayMetrics";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

type Props = {
  visible: boolean;
  layout: TodayLayout;
  onSave: (next: TodayLayout) => void;
  onClose: () => void;
};

function ReorderButton({ icon, disabled, onPress, label }: { icon: "up" | "down"; disabled: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={{
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <View style={{ transform: [{ rotate: icon === "up" ? "180deg" : "0deg" }] }}>
        <ChevronDown color={colors.textPrimary} size={16} />
      </View>
    </Pressable>
  );
}

export function CustomizeTodaySheet({ visible, layout, onSave, onClose }: Props) {
  const t = useT();
  const [order, setOrder] = useState<TodaySectionId[]>(layout.order);
  const [hidden, setHidden] = useState<TodaySectionId[]>(layout.hidden);
  const [metrics, setMetrics] = useState(new Set(layout.metrics));

  // Re-sync local state whenever the sheet (re)opens with a fresh layout.
  const [seed, setSeed] = useState(visible);
  if (visible !== seed) {
    setSeed(visible);
    if (visible) {
      setOrder(layout.order);
      setHidden(layout.hidden);
      setMetrics(new Set(layout.metrics));
    }
  }

  const toggleHidden = (id: TodaySectionId) =>
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const toggleMetric = (id: string) =>
    setMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(id as never)) next.delete(id as never);
      else next.add(id as never);
      return next;
    });

  const save = () => {
    onSave({
      order,
      hidden,
      metrics: TODAY_GRID_METRICS.filter((m) => metrics.has(m)),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }} accessibilityLabel={t("customize.close")}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surfaceElevated,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xxl,
            maxHeight: "86%",
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>{t("customize.title")}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs, lineHeight: 20 }}>
            {t("customize.subtitle")}
          </Text>

          <ScrollView style={{ marginTop: spacing.lg }} showsVerticalScrollIndicator={false}>
            <Text style={sectionLabel}>{t("customize.sections")}</Text>
            {order.map((id, i) => {
              const isHidden = hidden.includes(id);
              const sectionName = t("section." + id);
              return (
                <View
                  key={id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ flex: 1, color: isHidden ? colors.textMuted : colors.textPrimary, fontSize: 15, fontWeight: "600" }}>
                    {sectionName}
                  </Text>
                  <ReorderButton icon="up" disabled={i === 0} onPress={() => setOrder((o) => moveSection(o, id, -1))} label={t("customize.moveUp", { x: sectionName })} />
                  <ReorderButton icon="down" disabled={i === order.length - 1} onPress={() => setOrder((o) => moveSection(o, id, 1))} label={t("customize.moveDown", { x: sectionName })} />
                  <Pressable
                    onPress={() => toggleHidden(id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: !isHidden }}
                    accessibilityLabel={t("customize.toggleState", { label: sectionName, state: isHidden ? t("customize.hidden") : t("customize.shown") })}
                    style={{
                      paddingHorizontal: spacing.md,
                      height: 32,
                      borderRadius: radius.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isHidden ? "transparent" : colors.star,
                      borderWidth: 1,
                      borderColor: isHidden ? colors.border : colors.star,
                    }}
                  >
                    <Text style={{ color: isHidden ? colors.textMuted : colors.bg, fontSize: 12, fontWeight: "700" }}>
                      {isHidden ? t("customize.hidden") : t("customize.shown")}
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <Text style={[sectionLabel, { marginTop: spacing.xl }]}>{t("customize.gridNutrients")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {TODAY_GRID_METRICS.map((id) => {
                const on = metrics.has(id);
                const metricName = t("metric." + id);
                return (
                  <Pressable
                    key={id}
                    onPress={() => toggleMetric(id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={metricName}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.xs,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: on ? colors.star : colors.border,
                      backgroundColor: on ? colors.star : colors.surface,
                    }}
                  >
                    {on ? <Check color={colors.bg} size={14} /> : null}
                    <Text style={{ color: on ? colors.bg : colors.textPrimary, fontSize: 13, fontWeight: on ? "700" : "500" }}>
                      {metricName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ marginTop: spacing.lg }}>
            <Button label={t("customize.done")} onPress={save} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sectionLabel = {
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: "700" as const,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  marginBottom: spacing.sm,
};
