const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function formatScheduledDays(days: number[]): string {
  if (!days.length) return "No days set";
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return "Every day";
  if (sorted.join(",") === "1,2,3,4,5") return "Mon–Fri";
  if (sorted.join(",") === "0,6") return "Sat–Sun";
  return sorted.map((d) => DAY_LABELS[d] ?? "?").join(" · ");
}

export const DAY_PRESETS = {
  weekdays: [1, 2, 3, 4, 5],
  weekend: [0, 6],
  every: [0, 1, 2, 3, 4, 5, 6],
} as const;

export { DAY_LABELS };
