import { Text, View } from "react-native";
import { Button, GlassModal } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  visible: boolean;
  /** What's being tossed, shown so the user knows exactly what they'd lose. */
  label?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Two-step warning before an unsaved scan is thrown away. Mirrors the in-app
 *  Modal idiom already used for the barcode-match sheet (themed, not the OS alert). */
export function DiscardMealDialog({ visible, label, onCancel, onConfirm }: Props) {
  const t = useT();
  return (
    <GlassModal visible={visible} onClose={onCancel}>
      <View>
        <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: "700" }}>{t("discard.title")}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 }}>
          {label ? t("discard.bodyNamed", { label }) : t("discard.bodyGeneric")}
        </Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={t("discard.confirm")} variant="destructive" onPress={onConfirm} />
        <Button label={t("discard.keep")} variant="ghost" onPress={onCancel} />
      </View>
    </GlassModal>
  );
}
