// Pure pace helpers for the Today Pace Ring. No I/O, no React, no Date.now()
// inside (callers pass `now`). Mirrors the backend PACE_CURVE in
// backend/app/services/today.py so the client fallback and the server's
// `pace_position` agree at any given hour.

export type PaceState = "on" | "behind" | "ahead" | "over";

/** On-pace band: |consumed_fraction − pace_fraction| within this reads as "on pace". */
export const PACE_ON_THRESHOLD = 0.05;

// Absorbs float error so an exact ±THRESHOLD delta (e.g. 0.55−0.5 = 0.0500…04) stays "on".
const PACE_EPSILON = 1e-9;

/** Expected-intake-by-now curve, keyed on local hour. Must match the backend table. */
export const PACE_CURVE: ReadonlyArray<readonly [number, number]> = [
  [0, 0.0], [6, 0.0], [7, 0.0], [8, 0.1], [9, 0.15],
  [10, 0.2], [11, 0.3], [12, 0.4], [13, 0.5], [14, 0.58],
  [15, 0.64], [16, 0.68], [17, 0.72], [18, 0.75], [19, 0.8],
  [20, 0.88], [21, 0.94], [22, 0.98], [23, 1.0],
];

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/**
 * Pace position `p` (0..1) for the device-local time. `now` is already local on
 * device, so no timezone offset is applied here (unlike the backend, which
 * receives UTC plus an explicit offset). This is the offline fallback for the
 * server's `pace_position`.
 */
export function computePaceFraction(now: Date): number {
  const hour = now.getHours() + now.getMinutes() / 60;
  const first = PACE_CURVE[0];
  const last = PACE_CURVE[PACE_CURVE.length - 1];
  if (hour <= first[0]) return first[1];
  if (hour >= last[0]) return last[1];
  for (let i = 0; i < PACE_CURVE.length - 1; i++) {
    const [h0, f0] = PACE_CURVE[i];
    const [h1, f1] = PACE_CURVE[i + 1];
    if (hour >= h0 && hour <= h1) {
      const span = h1 - h0;
      const frac = span === 0 ? 0 : (hour - h0) / span;
      return clamp01(f0 + frac * (f1 - f0));
    }
  }
  return 1;
}

type PaceStateArgs = {
  consumedCalories: number;
  target: number;
  burnedCalories: number;
  paceFraction: number | null;
};

/**
 * Derive the pace state from consumed vs. effective target and the pace
 * fraction. Returns null when there is no meaningful signal (no target, or no
 * pace fraction). Thresholds per the Today-tab UX precedent §3.
 */
export function computePaceState({
  consumedCalories,
  target,
  burnedCalories,
  paceFraction,
}: PaceStateArgs): PaceState | null {
  if (!target || paceFraction == null) return null;
  const effectiveTarget = target + burnedCalories;
  if (effectiveTarget <= 0) return null;
  const f = consumedCalories / effectiveTarget;
  if (!Number.isFinite(f)) return null;
  if (f > 1.0) return "over";
  const delta = f - paceFraction;
  if (Math.abs(delta) <= PACE_ON_THRESHOLD + PACE_EPSILON) return "on";
  return delta < 0 ? "behind" : "ahead";
}

type ResolvePaceArgs = {
  now: Date;
  serverPacePosition: number | null | undefined;
  consumedCalories: number;
  target: number;
  burnedCalories: number;
};

/**
 * "Server wins, client falls back": use the server `pace_position` when present,
 * otherwise compute it locally; then derive the state. This is the single
 * call-site helper the Today screen (Story 4.6) wires in.
 */
export function resolvePace({
  now,
  serverPacePosition,
  consumedCalories,
  target,
  burnedCalories,
}: ResolvePaceArgs): { fraction: number | null; state: PaceState | null } {
  // Only trust a finite, in-range server value; otherwise fall back to the
  // local curve. (A NaN/Infinity/out-of-range value would corrupt the 0–1 ring
  // and silently misclassify the state.)
  const fraction =
    typeof serverPacePosition === "number" && Number.isFinite(serverPacePosition)
      ? clamp01(serverPacePosition)
      : computePaceFraction(now);
  const state = computePaceState({
    consumedCalories,
    target,
    burnedCalories,
    paceFraction: fraction,
  });
  return { fraction, state };
}
