import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.xl,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.xl,
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: "700" }}>Discard this scan?</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 }}>
              {label ? `"${label}" isn't saved yet. ` : "This scan isn't saved yet. "}
              Discarding removes it for good.
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Button label="Discard" variant="destructive" onPress={onConfirm} />
            <Button label="Keep it" variant="ghost" onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
