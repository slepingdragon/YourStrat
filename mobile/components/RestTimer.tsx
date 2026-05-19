import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";

type Props = { seconds: number; onDone: () => void; onSkip: () => void };

export function RestTimer({ seconds, onDone, onSkip }: Props) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  return (
    <View style={{ alignItems: "center", paddingVertical: 24 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Rest</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 48, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {left}s
      </Text>
      <View style={{ marginTop: 24, width: "100%" }}>
        <Button label="Skip rest" variant="secondary" onPress={onSkip} />
      </View>
    </View>
  );
}
