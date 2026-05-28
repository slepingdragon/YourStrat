import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AnimatedProgressBar } from "./AnimatedProgressBar";

type Props = { progress: number };

export function ProgressBar({ progress }: Props) {
  return (
    <AnimatedProgressBar
      progress={progress}
      color={colors.star}
      height={4}
      style={{ marginBottom: spacing.xl }}
    />
  );
}
