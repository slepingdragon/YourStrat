/** IANA timezone from the device (fallback UTC). */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export const DAY_START_OPTIONS = [
  { minutes: 0, labelKey: "profile.dayStartMidnight" as const },
  { minutes: 120, labelKey: "profile.dayStart2am" as const },
  { minutes: 240, labelKey: "profile.dayStart4am" as const },
  { minutes: 360, labelKey: "profile.dayStart6am" as const },
] as const;

export const DEFAULT_DAY_START_MINUTES = 120;

export function formatDayStartMinutes(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
