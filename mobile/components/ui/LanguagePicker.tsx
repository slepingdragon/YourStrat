import { useState } from "react";
import { Modal, Platform, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "@/components/icons";
import { LANGUAGES, useI18n, useT, type Lang } from "@/lib/i18n";
import { colors } from "@/theme/colors";
import { glass, glassInline } from "@/theme/glass";
import { radius, spacing } from "@/theme/spacing";

type Variant = "row" | "chip";

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

const isWeb = Platform.OS === "web";
const ROW_MIN_HEIGHT = 56;

const panelGlass: ViewStyle = isWeb
  ? ({
      backgroundColor: "rgba(12, 12, 16, 0.62)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
    } as ViewStyle)
  : { backgroundColor: "rgba(18, 18, 23, 0.88)" };

function LanguageOptionRow({
  label,
  active,
  onPress,
  isLast,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        width: "100%",
        minHeight: ROW_MIN_HEIGHT,
        justifyContent: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        marginBottom: isLast ? 0 : spacing.xs,
        borderRadius: radius.lg,
        backgroundColor: active
          ? "rgba(255, 255, 255, 0.12)"
          : pressed
            ? "rgba(255, 255, 255, 0.06)"
            : "transparent",
      })}
    >
      <Text
        style={{
          color: active ? colors.textPrimary : colors.textSecondary,
          fontSize: 16,
          fontWeight: active ? "700" : "500",
          lineHeight: 22,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LanguagePicker({ variant = "row", style }: Props) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const setLang = useI18n((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const close = () => setOpen(false);

  const pick = (code: Lang) => {
    if (code !== lang) {
      Haptics.selectionAsync();
      setLang(code);
    }
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("auth.changeLanguage")}
        accessibilityHint={current.native}
        style={({ pressed }) => [
          variant === "chip"
            ? {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: glass.border,
                backgroundColor: glass.chipFill,
              }
            : {
                ...glassInline.card,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: radius.lg,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                minHeight: 56,
              },
          { opacity: pressed ? 0.88 : 1 },
          style,
        ]}
      >
        {variant === "chip" ? (
          <>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>{current.native}</Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </>
        ) : (
          <>
            <View style={{ flex: 1, paddingRight: spacing.sm }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                {t("profile.selectLanguage")}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: spacing.xs / 2, lineHeight: 18 }}>
                {current.native}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.textSecondary} />
          </>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View
          style={{
            flex: 1,
            backgroundColor: glass.scrimDialog,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
          }}
        >
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View
            style={[
              {
                width: "100%",
                maxWidth: 360,
                alignSelf: "center",
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: glass.border,
                overflow: "hidden",
              },
              panelGlass,
            ]}
          >
            <View style={{ padding: spacing.xl }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 19,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {t("profile.language")}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "center",
                  marginTop: spacing.sm,
                  marginBottom: spacing.xl,
                }}
              >
                {t("profile.languageHint")}
              </Text>

              {LANGUAGES.map((l, index) => (
                <LanguageOptionRow
                  key={l.code}
                  label={l.native}
                  active={l.code === lang}
                  onPress={() => pick(l.code as Lang)}
                  isLast={index === LANGUAGES.length - 1}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
