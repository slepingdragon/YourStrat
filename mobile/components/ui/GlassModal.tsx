import { ReactNode } from "react";
import { Modal, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { glass } from "@/theme/glass";
import { radius, spacing } from "@/theme/spacing";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Center card (default) or bottom sheet */
  placement?: "center" | "bottom";
  panelStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
};

export function GlassModal({
  visible,
  onClose,
  children,
  placement = "center",
  panelStyle,
  maxWidth = 360,
}: Props) {
  const bottom = placement === "bottom";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: placement === "bottom" ? glass.scrim : glass.scrimDialog,
          justifyContent: bottom ? "flex-end" : "center",
          alignItems: bottom ? "stretch" : "center",
          paddingHorizontal: bottom ? 0 : spacing.xl,
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: bottom ? undefined : maxWidth }}>
          <GlassPanel
            variant={bottom ? "modal" : "dialog"}
            intensity={bottom ? 56 : 80}
            style={[
              {
                padding: spacing.xl,
                borderRadius: bottom ? 0 : radius.xl,
                ...(bottom
                  ? {
                      borderTopLeftRadius: radius.xl,
                      borderTopRightRadius: radius.xl,
                      borderBottomWidth: 0,
                    }
                  : null),
              },
              panelStyle,
            ]}
          >
            {children}
          </GlassPanel>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
