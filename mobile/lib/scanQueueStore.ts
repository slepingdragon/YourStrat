import { create } from "zustand";
import type { MealItem } from "./api";

export type ScanStatus = "pending" | "ready" | "error";

export type QueuedScan = {
  id: string;
  status: ScanStatus;
  /** Recognized items once ready; empty while pending or if nothing was found. */
  items: MealItem[];
  /** Local URI of the captured photo (kept for a future real-upload; not sent today). */
  photoUri?: string;
  /** Short title shown on the tab (food name once ready). */
  label: string;
  /** Total kcal once ready — drives the tab subtitle. */
  calories: number;
  createdAt: number;
};

type ScanQueueState = {
  queue: QueuedScan[];
  /** Whether the app-wide bar is fanned open into its list. */
  expanded: boolean;
  /** Add a pending tab the instant a photo is captured (before the scan returns). */
  enqueue: (id: string, photoUri?: string) => void;
  /** Fill in a tab when its scan returns. */
  resolve: (id: string, items: MealItem[]) => void;
  /** Mark a tab failed (network/scan error) so the user can retry or discard it. */
  fail: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setExpanded: (expanded: boolean) => void;
};

function deriveLabel(items: MealItem[]): string {
  if (!items.length) return "No food found";
  if (items.length === 1) return items[0].name;
  return `${items[0].name} +${items.length - 1}`;
}

export const useScanQueue = create<ScanQueueState>((set) => ({
  queue: [],
  expanded: false,
  enqueue: (id, photoUri) =>
    set((s) => ({
      // Newest first: the freshest scan is the front of the stack.
      queue: [
        { id, status: "pending", items: [], photoUri, label: "New scan", calories: 0, createdAt: Date.now() },
        ...s.queue,
      ],
    })),
  resolve: (id, items) =>
    set((s) => ({
      queue: s.queue.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "ready" as const,
              items,
              label: deriveLabel(items),
              calories: items.reduce((sum, it) => sum + (it.calories || 0), 0),
            }
          : q,
      ),
    })),
  fail: (id) =>
    set((s) => ({
      queue: s.queue.map((q) => (q.id === id ? { ...q, status: "error" as const, label: "Scan failed" } : q)),
    })),
  remove: (id) => set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),
  clear: () => set({ queue: [], expanded: false }),
  setExpanded: (expanded) => set({ expanded }),
}));
