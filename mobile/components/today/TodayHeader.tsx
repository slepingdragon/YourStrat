import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function timeOfDayTag(hour: number): string {
  if (hour < 11) return "Morning";
  if (hour < 14) return "Midday";
  if (hour < 18) return "Afternoon";
  if (hour < 22) return "Evening";
  return "Late night";
}

export function formatHeaderDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  now?: Date;
};

export function TodayHeader({ now }: Props) {
  const d = now ?? new Date();
  const date = formatHeaderDate(d);
  const tag = timeOfDayTag(d.getHours());

  return (
    <View style={{ alignItems: "center", marginBottom: 20 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {date}  ·  {tag}
      </Text>
    </View>
  );
}
