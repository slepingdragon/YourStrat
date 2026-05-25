import { memo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { ChevronRight, Trash, Play } from "@/components/icons";
import { RpePicker, rpeLabel } from "@/components/RpePicker";
import type { Routine } from "@/lib/api";
import { displayRoutineName, routineExerciseCount } from "@/lib/routineName";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";

const THRESHOLD = 80;

type Props = {
  routine: Routine;
  onOpen: () => void;
  /** Start the session at the chosen effort (null = skip RPE). */
  onStart: (rpe: number | null) => void;
  onDelete?: () => void;
  /** True while a start is in flight (guards double-fire, shows loading). */
  starting?: boolean;
};

function exerciseCountLabel(count: number): string {
  if (count === 0) return "No exercises yet";
  return count === 1 ? "1 exercise" : `${count} exercises`;
}

function confirmDelete(name: string, onConfirm: () => void) {
  const title = `Delete "${name}"?`;
  const message = "This permanently removes the routine and all its exercises. This cannot be undone.";
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}

function RoutineCardImpl({ routine, onOpen, onStart, onDelete, starting }: Props) {
  const count = routineExerciseCount(routine);
  const title = displayRoutineName(routine.name);
  const canStart = count > 0;

  const [rpeOpen, setRpeOpen] = useState(false);
  const [rpe, setRpe] = useState<number | null>(null);
  const translateX = useSharedValue(0);

  const openRpe = () => {
    if (!canStart) return;
    Haptics.selectionAsync();
    setRpe(null);
    setRpeOpen(true);
  };

  const askDelete = () => {
    if (onDelete) confirmDelete(title, onDelete);
  };

  // Plain booleans so the UI-thread gesture worklet never closes over a fn prop.
  const canDelete = !!onDelete;
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -THRESHOLD && canStart) {
        translateX.value = withSpring(0);
        runOnJS(openRpe)();
      } else if (e.translationX > THRESHOLD && canDelete) {
        translateX.value = withSpring(0);
        runOnJS(askDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
        {/* Reveal layer behind the row: delete (left) / start (right). */}
        <View style={[StyleSheet.absoluteFill, { flexDirection: "row" }]}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.error,
              alignItems: "flex-start",
              justifyContent: "center",
              paddingLeft: spacing.lg,
            }}
          >
            <Trash color={colors.bg} size={20} />
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: canStart ? colors.success : colors.surface,
              alignItems: "flex-end",
              justifyContent: "center",
              paddingRight: spacing.lg,
            }}
          >
            {canStart ? <Play color={colors.bg} size={20} /> : null}
          </View>
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[{ backgroundColor: colors.surfaceElevated }, rowStyle]}>
            <Pressable
              onPress={onOpen}
              accessibilityRole="button"
              accessibilityLabel={`Open routine ${title}, ${exerciseCountLabel(count)}`}
              accessibilityActions={[
                ...(canStart ? [{ name: "start" as const, label: "Start workout" }] : []),
                ...(onDelete ? [{ name: "delete" as const, label: "Delete routine" }] : []),
              ]}
              onAccessibilityAction={(e) => {
                if (e.nativeEvent.actionName === "start") openRpe();
                else if (e.nativeEvent.actionName === "delete") askDelete();
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
                gap: spacing.sm,
              })}
            >
              <Text
                numberOfLines={1}
                style={{ flexShrink: 1, color: colors.textPrimary, fontWeight: "700", fontSize: 16 }}
              >
                {title}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>· {exerciseCountLabel(count)}</Text>
              <View style={{ flex: 1 }} />
              <ChevronRight color={colors.textMuted} size={20} />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {rpeOpen ? (
        <Animated.View
          entering={FadeInDown.springify().damping(18)}
          style={{
            marginTop: spacing.sm,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.xl,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>How hard will you push?</Text>
          <RpePicker value={rpe} onChange={setRpe} size="compact" />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Skip"
                variant="ghost"
                compact
                onPress={() => onStart(null)}
                disabled={starting}
              />
            </View>
            <View style={{ flex: 1.4 }}>
              <Button
                label={rpe ? `Start at ${rpe} · ${rpeLabel(rpe)}` : "Start"}
                compact
                onPress={() => onStart(rpe)}
                loading={starting}
              />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

export const RoutineCard = memo(
  RoutineCardImpl,
  (prev, next) =>
    prev.routine.id === next.routine.id &&
    prev.routine.name === next.routine.name &&
    prev.routine.exercise_count === next.routine.exercise_count &&
    prev.starting === next.starting
);
