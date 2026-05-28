import { colors } from "@/theme/colors";

/** 0 = at or under target, 1 = severely over (ramps over ~30% of daily target). */
export function calorieOverSeverity(consumed: number, target: number): number {
  if (target <= 0 || consumed <= target) return 0;
  const over = consumed - target;
  return Math.min(1, over / (target * 0.3));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const u = Math.min(1, Math.max(0, t));
  return toHex(ar + (br - ar) * u, ag + (bg - ag) * u, ab + (bb - ab) * u);
}

export function ringColorForCalories(consumed: number, target: number): string {
  const severity = calorieOverSeverity(consumed, target);
  if (severity <= 0) return colors.star;
  return lerpHex(colors.star, colors.error, severity);
}

export function overStrokeColorForCalories(consumed: number, target: number): string {
  const severity = calorieOverSeverity(consumed, target);
  return lerpHex(colors.starDim, colors.error, Math.min(1, severity * 1.15));
}

export function textColorForCalories(consumed: number, target: number, remaining: number): string {
  if (remaining >= 0) return colors.textPrimary;
  const severity = calorieOverSeverity(consumed, target);
  return lerpHex(colors.textPrimary, colors.error, severity);
}
