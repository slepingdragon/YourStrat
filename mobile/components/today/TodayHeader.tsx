import { Text, View } from "react-native";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme/colors";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Returns an i18n key for the time-of-day greeting (callers translate it). */
export function timeOfDayTag(hour: number): string {
  if (hour < 11) return "today.morning";
  if (hour < 14) return "today.midday";
  if (hour < 18) return "today.afternoon";
  if (hour < 22) return "today.evening";
  return "today.lateNight";
}

export function formatHeaderDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  now?: Date;
};

export function TodayHeader({ now }: Props) {
  const t = useT();
  const d = now ?? new Date();
  const date = formatHeaderDate(d);
  const tag = t(timeOfDayTag(d.getHours()));

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
