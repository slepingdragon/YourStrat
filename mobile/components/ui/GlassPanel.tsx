import { ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { glass, glassShell, glassTint, type GlassTintVariant } from "@/theme/glass";
import { spacing } from "@/theme/spacing";

type GlassVariant = GlassTintVariant;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: GlassVariant;
};

/** Dialogs use a flat fill (no absolute overlay stack) so list rows stay visible on web. */
export function GlassPanel({ children, style, intensity = 48, variant = "card" }: Props) {
  if (variant === "dialog") {
    return (
      <View style={[glassShell(), glassTint("dialog"), style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[glassShell(), style]}>
      {Platform.OS !== "web" ? (
        <BlurView intensity={intensity} tint="dark" style={[StyleSheet.absoluteFillObject, styles.layer]} />
      ) : null}
      <View
        style={[StyleSheet.absoluteFillObject, styles.layer, glassTint(variant)]}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
  },
});
