import { Platform, type ViewStyle } from "react-native";

/** Neutral blacks from app bg/surface — no blue-violet cast in rgba fills. */
const BG_RGB = "8, 8, 11";
const SURFACE_RGB = "18, 18, 23";

/** Frosted glass fills — keep text on `colors.textPrimary` / `textSecondary`. */
export const glass = {
  scrim: "rgba(0, 0, 0, 0.42)",
  scrimDialog: "rgba(0, 0, 0, 0.65)",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  chipFill: "rgba(255, 255, 255, 0.06)",
  overlayCard: `rgba(${BG_RGB}, 0.58)`,
  overlayModal: `rgba(${SURFACE_RGB}, 0.72)`,
  /** Centered dialogs — neutral black frost */
  overlayDialog: `rgba(${BG_RGB}, 0.90)`,
  overlayDialogMatte: "rgba(0, 0, 0, 0.52)",
  optionIdle: `rgba(${SURFACE_RGB}, 0.98)`,
  optionPressed: `rgba(${SURFACE_RGB}, 1)`,
  optionSelected: `rgba(27, 27, 34, 1)`,
  overlayInput: `rgba(${SURFACE_RGB}, 0.82)`,
  overlayTrack: `rgba(${SURFACE_RGB}, 0.55)`,
} as const;

function webBlur(px: number): ViewStyle {
  return Platform.OS === "web"
    ? ({
        backdropFilter: `blur(${px}px)`,
        WebkitBackdropFilter: `blur(${px}px)`,
      } as ViewStyle)
    : {};
}

const WEB_BLUR_CARD = webBlur(28);
const WEB_BLUR_DIALOG = webBlur(36);

export function glassShell(extra?: ViewStyle): ViewStyle {
  return {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: glass.border,
    ...extra,
  };
}

export type GlassTintVariant = "card" | "modal" | "dialog" | "input" | "track";

export function glassTint(variant: GlassTintVariant): ViewStyle {
  const fill =
    variant === "dialog"
      ? glass.overlayDialog
      : variant === "modal"
        ? glass.overlayModal
        : variant === "input"
          ? glass.overlayInput
          : variant === "track"
            ? glass.overlayTrack
            : glass.overlayCard;
  const blur = variant === "dialog" ? WEB_BLUR_DIALOG : WEB_BLUR_CARD;
  return {
    backgroundColor: fill,
    ...blur,
  };
}

export function dialogChoiceRow(active: boolean, pressed: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: active ? glass.optionSelected : pressed ? glass.optionPressed : glass.optionIdle,
    borderWidth: active ? 1 : 0,
    borderColor: glass.borderStrong,
  };
}

export const glassInline: Record<"card" | "elevated" | "chip", ViewStyle> = {
  card: {
    backgroundColor: glass.overlayCard,
    borderWidth: 1,
    borderColor: glass.border,
    ...WEB_BLUR_CARD,
  },
  elevated: {
    backgroundColor: glass.overlayModal,
    borderWidth: 1,
    borderColor: glass.border,
    ...WEB_BLUR_CARD,
  },
  chip: {
    backgroundColor: glass.chipFill,
    borderWidth: 1,
    borderColor: glass.border,
  },
};
