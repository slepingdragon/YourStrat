import AsyncStorage from "@react-native-async-storage/async-storage";
import { TODAY_GRID_METRICS, type TodayMetricId } from "@/lib/todayMetrics";

// Personalizable Today layout (owner request): which sections show + in what
// order, plus which nutrient cards fill the "Right now" grid. The calorie hero
// and the "Log food" CTA are fixed anchors — only these sections are arrangeable.
export type TodaySectionId = "nutrients" | "workout" | "trend" | "effort" | "meals";

export const ALL_TODAY_SECTIONS: TodaySectionId[] = ["nutrients", "workout", "trend", "effort", "meals"];

export const TODAY_SECTION_LABELS: Record<TodaySectionId, string> = {
  nutrients: "Nutrients",
  workout: "Workout",
  trend: "7-day trend",
  effort: "Today's effort",
  meals: "Meals",
};

export type TodayLayout = {
  /** All sections, in display order (always a full permutation of ALL_TODAY_SECTIONS). */
  order: TodaySectionId[];
  /** Sections the user hid. */
  hidden: TodaySectionId[];
  /** Non-calorie nutrients shown in the grid (calories is the hero). */
  metrics: TodayMetricId[];
};

export const DEFAULT_TODAY_LAYOUT: TodayLayout = {
  order: ["nutrients", "workout", "effort", "trend", "meals"],
  hidden: [],
  metrics: ["protein", "carbs", "fat", "fiber", "sugar", "sodium"],
};

const STORAGE_KEY = "yourstrat_today_layout";

function isSection(v: unknown): v is TodaySectionId {
  return typeof v === "string" && (ALL_TODAY_SECTIONS as string[]).includes(v);
}
function isGridMetric(v: unknown): v is TodayMetricId {
  return typeof v === "string" && (TODAY_GRID_METRICS as string[]).includes(v);
}

export function normalizeTodayLayout(raw: unknown): TodayLayout {
  if (!raw || typeof raw !== "object") {
    return { order: [...DEFAULT_TODAY_LAYOUT.order], hidden: [], metrics: [...DEFAULT_TODAY_LAYOUT.metrics] };
  }
  const r = raw as Partial<TodayLayout>;

  // order: keep valid+unique, then append any sections missing (so a future
  // new section always appears rather than vanishing).
  const order: TodaySectionId[] = [];
  for (const id of Array.isArray(r.order) ? r.order : []) {
    if (isSection(id) && !order.includes(id)) order.push(id);
  }
  for (const id of ALL_TODAY_SECTIONS) if (!order.includes(id)) order.push(id);

  const hidden: TodaySectionId[] = [];
  for (const id of Array.isArray(r.hidden) ? r.hidden : []) {
    if (isSection(id) && !hidden.includes(id)) hidden.push(id);
  }

  // metrics: honor an explicit (even empty) array; only fall back to default
  // when the field is absent/garbage.
  let metrics: TodayMetricId[];
  if (Array.isArray(r.metrics)) {
    metrics = [];
    for (const m of r.metrics) if (isGridMetric(m) && !metrics.includes(m)) metrics.push(m);
  } else {
    metrics = [...DEFAULT_TODAY_LAYOUT.metrics];
  }

  return { order, hidden, metrics };
}

export async function loadTodayLayout(): Promise<TodayLayout> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [...DEFAULT_TODAY_LAYOUT.order], hidden: [], metrics: [...DEFAULT_TODAY_LAYOUT.metrics] };
    return normalizeTodayLayout(JSON.parse(raw));
  } catch {
    return { order: [...DEFAULT_TODAY_LAYOUT.order], hidden: [], metrics: [...DEFAULT_TODAY_LAYOUT.metrics] };
  }
}

export async function saveTodayLayout(layout: TodayLayout): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeTodayLayout(layout)));
}

/** Visible sections in order (drops hidden). */
export function visibleSections(layout: TodayLayout): TodaySectionId[] {
  return layout.order.filter((id) => !layout.hidden.includes(id));
}

/** Move a section up/down within the order (pure; for the Customize sheet). */
export function moveSection(order: TodaySectionId[], id: TodaySectionId, dir: -1 | 1): TodaySectionId[] {
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
