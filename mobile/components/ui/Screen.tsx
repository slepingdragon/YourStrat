import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme/colors";

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
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: scrollGrow ? 1 : 0, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
