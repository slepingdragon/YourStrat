import { createExercise, listExercises, type Exercise } from "@/lib/api";
import type { CatalogExercise } from "@/lib/exerciseCatalog";

export async function resolveCatalogToExercises(catalog: CatalogExercise[]): Promise<Exercise[]> {
  const existing = await listExercises();
  const byName = new Map(existing.map((e) => [e.name.toLowerCase(), e]));
  const resolved: Exercise[] = [];

  for (const item of catalog) {
    const hit = byName.get(item.name.toLowerCase());
    if (hit) {
      resolved.push(hit);
      continue;
    }
    const created = await createExercise({
      name: item.name,
      type: item.type,
      met_value: item.met_value,
      default_sets: item.default_sets,
      default_reps: item.default_reps,
      default_duration_sec: item.default_duration_sec,
    });
    byName.set(item.name.toLowerCase(), created);
    resolved.push(created);
  }

  return resolved;
}
