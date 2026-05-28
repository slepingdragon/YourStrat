import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { BloomBackground } from "./BloomBackground";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** When false, scroll content does not stretch to fill the viewport (shorter lists). */
  scrollGrow?: boolean;
  edges?: Edge[];
  padding?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  scrollGrow = true,
  edges = ["top", "bottom"],
  padding = true,
  contentStyle,
}: Props) {
  const content = (
    <View
      style={[
        { flex: 1, paddingHorizontal: padding ? 24 : 0, width: "100%", maxWidth: 480, alignSelf: "center" },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, overflow: "hidden" }}>
      <BloomBackground />
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <StatusBar style="light" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {scroll ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: scrollGrow ? 1 : 0, paddingBottom: spacing.xxxl - spacing.sm }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
