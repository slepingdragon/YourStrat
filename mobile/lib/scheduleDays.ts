import { translate } from "@/lib/i18n";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function formatScheduledDays(days: number[]): string {
  if (!days.length) return translate("routine.noDaysSet");
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return translate("routine.presetEvery");
  if (sorted.join(",") === "1,2,3,4,5") return translate("routine.presetWeekdays");
  if (sorted.join(",") === "0,6") return translate("routine.presetWeekend");
  return sorted.map((d) => DAY_LABELS[d] ?? "?").join(" · ");
}

export const DAY_PRESETS = {
  weekdays: [1, 2, 3, 4, 5],
  weekend: [0, 6],
  every: [0, 1, 2, 3, 4, 5, 6],
} as const;

export { DAY_LABELS };
