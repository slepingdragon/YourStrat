import { memo } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { ChevronRight, Trash } from "@/components/icons";
import type { Routine } from "@/lib/api";
import { formatScheduledDays } from "@/lib/scheduleDays";
import { displayRoutineName, routineExerciseCount } from "@/lib/routineName";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  routine: Routine;
  onOpen: () => void;
  onStart: () => void;
  onDelete?: () => void;
};

function exerciseMetaLine(count: number, scheduledDays?: number[]): string {
  const exercisePart =
    count === 0
      ? "No exercises yet"
      : count === 1
        ? "1 exercise"
        : `${count} exercises`;
  if (scheduledDays?.length) {
    return `${exercisePart} · ${formatScheduledDays(scheduledDays)}`;
  }
  return exercisePart;
}

function confirmDelete(name: string, onConfirm: () => void) {
  const title = `Delete "${name}"?`;
  const message = "This permanently removes the routine and all its exercises. This cannot be undone.";
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}

function RoutineCardImpl({ routine, onOpen, onStart, onDelete }: Props) {
  const count = routineExerciseCount(routine);
  const title = displayRoutineName(routine.name);
  const meta = exerciseMetaLine(count, routine.scheduled_days);
  const canStart = count > 0;

  return (
    <Card
      style={{
        marginBottom: spacing.md,
        backgroundColor: colors.surfaceElevated,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open routine ${title}`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.88 : 1,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          gap: spacing.sm,
        })}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 17, lineHeight: 22 }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 }}>
            {meta}
          </Text>
        </View>
        <ChevronRight color={colors.textMuted} size={20} />
      </Pressable>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            label="Start"
            variant="secondary"
            compact
            disabled={!canStart}
            onPress={onStart}
          />
        </View>
        {onDelete ? (
          <Pressable
            onPress={() => confirmDelete(title, onDelete)}
            accessibilityRole="button"
            accessibilityLabel={`Delete routine ${title}`}
            hitSlop={10}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.surface : "transparent",
            })}
          >
            <Trash color={colors.textMuted} size={18} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

export const RoutineCard = memo(
  RoutineCardImpl,
  (prev, next) =>
    prev.routine.id === next.routine.id &&
    prev.routine.name === next.routine.name &&
    prev.routine.exercise_count === next.routine.exercise_count &&
    (prev.routine.scheduled_days?.join(",") ?? "") === (next.routine.scheduled_days?.join(",") ?? "")
);
