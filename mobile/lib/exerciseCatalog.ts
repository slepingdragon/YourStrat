export type Muscle =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "cardio"
  | "mobility"
  | "arms";

export type CatalogExercise = {
  slug: string;
  name: string;
  muscle: Muscle;
  type: "strength" | "cardio" | "mobility";
  description: string;
  met_value?: number;
  default_sets?: number;
  default_reps?: number;
  default_duration_sec?: number;
};

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  mobility: "Mobility",
  arms: "Arms",
};

/** Simplified picker filters (mobility only appears under All). */
export type MuscleFilter =
  | "all"
  | "arms"
  | "legs"
  | "chest"
  | "back"
  | "shoulders"
  | "core"
  | "cardio";

export const MUSCLE_FILTER_OPTIONS: { id: MuscleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "core", label: "Core" },
  { id: "cardio", label: "Cardio" },
];

const ARMS_MUSCLES: Muscle[] = ["biceps", "triceps", "arms"];

export function matchesMuscleFilter(muscle: Muscle, filter: MuscleFilter): boolean {
  if (filter === "all") return true;
  if (filter === "arms") return ARMS_MUSCLES.includes(muscle);
  return muscle === filter;
}

export const EXERCISE_CATALOG: CatalogExercise[] = [
  {
    "slug": "barbell_bench_press",
    "name": "Barbell Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "dumbbell_bench_press",
    "name": "Dumbbell Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "incline_barbell_bench_press",
    "name": "Incline Barbell Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "incline_dumbbell_press",
    "name": "Incline Dumbbell Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "decline_bench_press",
    "name": "Decline Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "machine_chest_press",
    "name": "Machine Chest Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "cable_fly",
    "name": "Cable Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_fly",
    "name": "Dumbbell Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "pec_deck",
    "name": "Pec Deck",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "push_up",
    "name": "Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "wide_push_up",
    "name": "Wide Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "diamond_push_up",
    "name": "Diamond Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "chest_dip",
    "name": "Chest Dip",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "landmine_press",
    "name": "Landmine Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "floor_press",
    "name": "Floor Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "svend_press",
    "name": "Svend Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "cable_crossover",
    "name": "Cable Crossover",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "low_cable_fly",
    "name": "Low Cable Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "high_cable_fly",
    "name": "High Cable Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_dumbbell_press",
    "name": "Single-Arm Dumbbell Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hammer_strength_press",
    "name": "Hammer Strength Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "plate_press",
    "name": "Plate Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "resistance_band_press",
    "name": "Resistance Band Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "isometric_chest_hold",
    "name": "Isometric Chest Hold",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "paused_bench_press",
    "name": "Paused Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "barbell_row",
    "name": "Barbell Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pendlay_row",
    "name": "Pendlay Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "dumbbell_row",
    "name": "Dumbbell Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "single_arm_dumbbell_row",
    "name": "Single-Arm Dumbbell Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "t_bar_row",
    "name": "T-Bar Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "cable_row",
    "name": "Cable Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "seated_cable_row",
    "name": "Seated Cable Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "lat_pulldown",
    "name": "Lat Pulldown",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "wide_grip_pulldown",
    "name": "Wide-Grip Pulldown",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "close_grip_pulldown",
    "name": "Close-Grip Pulldown",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "pull_up",
    "name": "Pull-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "chin_up",
    "name": "Chin-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "neutral_grip_pull_up",
    "name": "Neutral-Grip Pull-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "assisted_pull_up",
    "name": "Assisted Pull-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "face_pull",
    "name": "Face Pull",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "straight_arm_pulldown",
    "name": "Straight-Arm Pulldown",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "meadows_row",
    "name": "Meadows Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "chest_supported_row",
    "name": "Chest-Supported Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "machine_row",
    "name": "Machine Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "inverted_row",
    "name": "Inverted Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "barbell_deadlift",
    "name": "Barbell Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "romanian_deadlift",
    "name": "Romanian Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "sumo_deadlift",
    "name": "Sumo Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "trap_bar_deadlift",
    "name": "Trap Bar Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "good_morning",
    "name": "Good Morning",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "back_extension",
    "name": "Back Extension",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "hyperextension",
    "name": "Hyperextension",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_pullover",
    "name": "Cable Pullover",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "kroc_row",
    "name": "Kroc Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "seal_row",
    "name": "Seal Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "overhead_press",
    "name": "Overhead Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "barbell_push_press",
    "name": "Barbell Push Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "dumbbell_shoulder_press",
    "name": "Dumbbell Shoulder Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "arnold_press",
    "name": "Arnold Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "machine_shoulder_press",
    "name": "Machine Shoulder Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "lateral_raise",
    "name": "Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_lateral_raise",
    "name": "Cable Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "front_raise",
    "name": "Front Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "rear_delt_fly",
    "name": "Rear Delt Fly",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_rear_delt_fly",
    "name": "Cable Rear Delt Fly",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "upright_row",
    "name": "Upright Row",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "barbell_shrug",
    "name": "Barbell Shrug",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "dumbbell_shrug",
    "name": "Dumbbell Shrug",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "cable_shrug",
    "name": "Cable Shrug",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "bradford_press",
    "name": "Bradford Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "landmine_shoulder_press",
    "name": "Landmine Shoulder Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "plate_front_raise",
    "name": "Plate Front Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "band_pull_apart",
    "name": "Band Pull-Apart",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "y_raise",
    "name": "Y Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "w_raise",
    "name": "W Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cuban_press",
    "name": "Cuban Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "scaption_raise",
    "name": "Scaption Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "kettlebell_press",
    "name": "Kettlebell Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "handstand_push_up",
    "name": "Handstand Push-Up",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "pike_push_up",
    "name": "Pike Push-Up",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "barbell_curl",
    "name": "Barbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "ez_bar_curl",
    "name": "EZ-Bar Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_curl",
    "name": "Dumbbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "hammer_curl",
    "name": "Hammer Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "incline_dumbbell_curl",
    "name": "Incline Dumbbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "preacher_curl",
    "name": "Preacher Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_preacher_curl",
    "name": "Machine Preacher Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_curl",
    "name": "Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "concentration_curl",
    "name": "Concentration Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "spider_curl",
    "name": "Spider Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bayesian_curl",
    "name": "Bayesian Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "drag_curl",
    "name": "Drag Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "reverse_curl",
    "name": "Reverse Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "zottman_curl",
    "name": "Zottman Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "21s_curl",
    "name": "21s Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cross_body_hammer_curl",
    "name": "Cross-Body Hammer Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_hammer_curl",
    "name": "Cable Hammer Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "rope_hammer_curl",
    "name": "Rope Hammer Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "chin_up_biceps_focus",
    "name": "Chin-Up Biceps Focus",
    "muscle": "biceps",
    "type": "strength",
    "description": "Compound movement for biceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "isometric_curl_hold",
    "name": "Isometric Curl Hold",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tricep_pushdown",
    "name": "Tricep Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "rope_pushdown",
    "name": "Rope Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "overhead_tricep_extension",
    "name": "Overhead Tricep Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_skull_crusher",
    "name": "Dumbbell Skull Crusher",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "ez_skull_crusher",
    "name": "EZ Skull Crusher",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "close_grip_bench_press",
    "name": "Close-Grip Bench Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "tricep_dip",
    "name": "Tricep Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "bench_dip",
    "name": "Bench Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "kickback",
    "name": "Kickback",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_pushdown",
    "name": "Single-Arm Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "jm_press",
    "name": "JM Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "tate_press",
    "name": "Tate Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "cable_overhead_extension",
    "name": "Cable Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "diamond_push_up_triceps",
    "name": "Diamond Push-Up Triceps",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "french_press",
    "name": "French Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "machine_tricep_extension",
    "name": "Machine Tricep Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "band_pushdown",
    "name": "Band Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "floor_press_close_grip",
    "name": "Floor Press Close Grip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "dumbbell_overhead_extension",
    "name": "Dumbbell Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bodyweight_tricep_extension",
    "name": "Bodyweight Tricep Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "back_squat",
    "name": "Back Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "front_squat",
    "name": "Front Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "goblet_squat",
    "name": "Goblet Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hack_squat",
    "name": "Hack Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "leg_press",
    "name": "Leg Press",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "bulgarian_split_squat",
    "name": "Bulgarian Split Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "walking_lunge",
    "name": "Walking Lunge",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "reverse_lunge",
    "name": "Reverse Lunge",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "leg_extension",
    "name": "Leg Extension",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "leg_curl",
    "name": "Leg Curl",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "seated_leg_curl",
    "name": "Seated Leg Curl",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "romanian_deadlift_legs",
    "name": "Romanian Deadlift Legs",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hip_thrust",
    "name": "Hip Thrust",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "glute_bridge",
    "name": "Glute Bridge",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "cable_kickback",
    "name": "Cable Kickback",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "step_up",
    "name": "Step-Up",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "box_squat",
    "name": "Box Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pause_squat",
    "name": "Pause Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "sumo_squat",
    "name": "Sumo Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "sissy_squat",
    "name": "Sissy Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "nordic_curl",
    "name": "Nordic Curl",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "standing_calf_raise",
    "name": "Standing Calf Raise",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "seated_calf_raise",
    "name": "Seated Calf Raise",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "donkey_calf_raise",
    "name": "Donkey Calf Raise",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "smith_machine_squat",
    "name": "Smith Machine Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "belt_squat",
    "name": "Belt Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pistol_squat",
    "name": "Pistol Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "wall_sit",
    "name": "Wall Sit",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "adductor_machine",
    "name": "Adductor Machine",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "abductor_machine",
    "name": "Abductor Machine",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hip_abduction",
    "name": "Hip Abduction",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hip_adduction",
    "name": "Hip Adduction",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "landmine_squat",
    "name": "Landmine Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "jefferson_squat",
    "name": "Jefferson Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "zercher_squat",
    "name": "Zercher Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "plank",
    "name": "Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "side_plank",
    "name": "Side Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "crunch",
    "name": "Crunch",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bicycle_crunch",
    "name": "Bicycle Crunch",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "hanging_leg_raise",
    "name": "Hanging Leg Raise",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "lying_leg_raise",
    "name": "Lying Leg Raise",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_crunch",
    "name": "Cable Crunch",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "ab_wheel_rollout",
    "name": "Ab Wheel Rollout",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "russian_twist",
    "name": "Russian Twist",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "mountain_climber",
    "name": "Mountain Climber",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "dead_bug",
    "name": "Dead Bug",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "bird_dog",
    "name": "Bird Dog",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "pallof_press",
    "name": "Pallof Press",
    "muscle": "core",
    "type": "strength",
    "description": "Compound movement for core and midsection. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "wood_chop",
    "name": "Wood Chop",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "toes_to_bar",
    "name": "Toes to Bar",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "v_up",
    "name": "V-Up",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "sit_up",
    "name": "Sit-Up",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "decline_sit_up",
    "name": "Decline Sit-Up",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hollow_hold",
    "name": "Hollow Hold",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "farmer_walk_core",
    "name": "Farmer Walk Core",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "turkish_get_up",
    "name": "Turkish Get-Up",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "windshield_wiper",
    "name": "Windshield Wiper",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "dragon_flag",
    "name": "Dragon Flag",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "cable_woodchop",
    "name": "Cable Woodchop",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "machine_crunch",
    "name": "Machine Crunch",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "treadmill_run",
    "name": "Treadmill Run",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "outdoor_run",
    "name": "Outdoor Run",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "walking",
    "name": "Walking",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 4
  },
  {
    "slug": "incline_walk",
    "name": "Incline Walk",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 4
  },
  {
    "slug": "stationary_bike",
    "name": "Stationary Bike",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "spin_bike",
    "name": "Spin Bike",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "rowing_machine",
    "name": "Rowing Machine",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "elliptical",
    "name": "Elliptical",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "stair_climber",
    "name": "Stair Climber",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "jump_rope",
    "name": "Jump Rope",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "battle_ropes",
    "name": "Battle Ropes",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "assault_bike",
    "name": "Assault Bike",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "swimming",
    "name": "Swimming",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "cycling",
    "name": "Cycling",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "hiit_sprints",
    "name": "HIIT Sprints",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "burpees",
    "name": "Burpees",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "jumping_jacks",
    "name": "Jumping Jacks",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "box_jumps",
    "name": "Box Jumps",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "kettlebell_swing_cardio",
    "name": "Kettlebell Swing Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "sled_push",
    "name": "Sled Push",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "sled_pull",
    "name": "Sled Pull",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "prowler_push",
    "name": "Prowler Push",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "shadow_boxing",
    "name": "Shadow Boxing",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "jump_squat_cardio",
    "name": "Jump Squat Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "mountain_climber_cardio",
    "name": "Mountain Climber Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "cat_cow",
    "name": "Cat-Cow",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "world_greatest_stretch",
    "name": "World Greatest Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "hip_flexor_stretch",
    "name": "Hip Flexor Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "hamstring_stretch",
    "name": "Hamstring Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "shoulder_dislocates",
    "name": "Shoulder Dislocates",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "thoracic_rotation",
    "name": "Thoracic Rotation",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "ankle_mobility",
    "name": "Ankle Mobility",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "wrist_circles",
    "name": "Wrist Circles",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "foam_roll_quads",
    "name": "Foam Roll Quads",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "foam_roll_back",
    "name": "Foam Roll Back",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "pigeon_pose",
    "name": "Pigeon Pose",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "child_pose",
    "name": "Child Pose",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "downward_dog",
    "name": "Downward Dog",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "band_pull_apart_mobility",
    "name": "Band Pull-Apart Mobility",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "90_90_hip",
    "name": "90-90 Hip",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "cable_biceps_curl",
    "name": "Cable Biceps Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_curl",
    "name": "Machine Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tricep_rope_extension",
    "name": "Tricep Rope Extension",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_cable_curl",
    "name": "Single-Arm Cable Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bench_pin_press",
    "name": "Bench Pin Press",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "floor_skull_crusher",
    "name": "Floor Skull Crusher",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "overhead_cable_extension",
    "name": "Overhead Cable Extension",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "wrist_curl",
    "name": "Wrist Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "reverse_wrist_curl",
    "name": "Reverse Wrist Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "farmer_carry",
    "name": "Farmer Carry",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pinwheel_curl",
    "name": "Pinwheel Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_kickback_triceps",
    "name": "Cable Kickback Triceps",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_kickback",
    "name": "Dumbbell Kickback",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "close_grip_push_up",
    "name": "Close-Grip Push-Up",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "chin_up_narrow",
    "name": "Chin-Up Narrow",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "neutral_grip_chin",
    "name": "Neutral Grip Chin",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "ez_bar_preacher_curl",
    "name": "EZ-Bar Preacher Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_dip",
    "name": "Machine Dip",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "weighted_dip",
    "name": "Weighted Dip",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "band_tricep_extension",
    "name": "Band Tricep Extension",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "incline_hammer_curl",
    "name": "Incline Hammer Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "decline_tricep_extension",
    "name": "Decline Tricep Extension",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_concentration_curl",
    "name": "Cable Concentration Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "smith_machine_curl",
    "name": "Smith Machine Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "landmine_row_single_arm",
    "name": "Landmine Row Single Arm",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "chest_press_machine_incline",
    "name": "Chest Press Machine Incline",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "push_press_light",
    "name": "Push Press Light",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "muscle_up",
    "name": "Muscle-Up",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "ring_dip",
    "name": "Ring Dip",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "band_face_pull",
    "name": "Band Face Pull",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "guillotine_press",
    "name": "Guillotine Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "neutral_grip_bench_press",
    "name": "Neutral-Grip Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "feet_up_bench_press",
    "name": "Feet-Up Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "spoto_press",
    "name": "Spoto Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "board_press",
    "name": "Board Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "reverse_grip_bench_press",
    "name": "Reverse-Grip Bench Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "squeeze_press",
    "name": "Squeeze Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "around_the_world",
    "name": "Around the World",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "cable_press_around",
    "name": "Cable Press Around",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "standing_cable_press",
    "name": "Standing Cable Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "incline_cable_fly",
    "name": "Incline Cable Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "decline_dumbbell_fly",
    "name": "Decline Dumbbell Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_fly",
    "name": "Machine Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "resistance_band_fly",
    "name": "Resistance Band Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "push_up_on_handles",
    "name": "Push-Up on Handles",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "archer_push_up",
    "name": "Archer Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "clap_push_up",
    "name": "Clap Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "weighted_push_up",
    "name": "Weighted Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "ring_push_up",
    "name": "Ring Push-Up",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "landmine_chest_press",
    "name": "Landmine Chest Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "single_arm_cable_press",
    "name": "Single-Arm Cable Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "kettlebell_floor_press",
    "name": "Kettlebell Floor Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "smith_incline_press",
    "name": "Smith Incline Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "smith_decline_press",
    "name": "Smith Decline Press",
    "muscle": "chest",
    "type": "strength",
    "description": "Compound movement for chest and pressing muscles. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "paused_fly",
    "name": "Paused Fly",
    "muscle": "chest",
    "type": "strength",
    "description": "Targets chest and pressing muscles with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "renegade_row",
    "name": "Renegade Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "yates_row",
    "name": "Yates Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "underhand_barbell_row",
    "name": "Underhand Barbell Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "wide_grip_barbell_row",
    "name": "Wide-Grip Barbell Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "snatch_grip_deadlift",
    "name": "Snatch-Grip Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "deficit_deadlift",
    "name": "Deficit Deadlift",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "block_pull",
    "name": "Block Pull",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "rack_pull",
    "name": "Rack Pull",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "single_arm_cable_row",
    "name": "Single-Arm Cable Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "iso_lateral_row",
    "name": "Iso-Lateral Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hammer_strength_high_row",
    "name": "Hammer Strength High Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hammer_strength_low_row",
    "name": "Hammer Strength Low Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "rope_straight_arm_pulldown",
    "name": "Rope Straight-Arm Pulldown",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "band_assisted_pull_up",
    "name": "Band-Assisted Pull-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "weighted_pull_up",
    "name": "Weighted Pull-Up",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "lat_pullover_machine",
    "name": "Lat Pullover Machine",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "dumbbell_pullover",
    "name": "Dumbbell Pullover",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "barbell_pullover",
    "name": "Barbell Pullover",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "reverse_hyper",
    "name": "Reverse Hyper",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "45_degree_back_extension",
    "name": "45-Degree Back Extension",
    "muscle": "back",
    "type": "strength",
    "description": "Targets back and lats with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bird_dog_row",
    "name": "Bird Dog Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "batwing_row",
    "name": "Batwing Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "chest_supported_t_bar_row",
    "name": "Chest-Supported T-Bar Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "landmine_row",
    "name": "Landmine Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "bent_over_cable_row",
    "name": "Bent-Over Cable Row",
    "muscle": "back",
    "type": "strength",
    "description": "Compound movement for back and lats. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "seated_overhead_press",
    "name": "Seated Overhead Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "z_press",
    "name": "Z-Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "viking_press",
    "name": "Viking Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "bottoms_up_kettlebell_press",
    "name": "Bottoms-Up Kettlebell Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "half_kneeling_press",
    "name": "Half-Kneeling Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "lu_raise",
    "name": "Lu Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "leaning_lateral_raise",
    "name": "Leaning Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_y_raise",
    "name": "Cable Y-Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "prone_rear_delt_raise",
    "name": "Prone Rear Delt Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "reverse_pec_deck",
    "name": "Reverse Pec Deck",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "snatch_grip_high_pull",
    "name": "Snatch-Grip High Pull",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hang_clean",
    "name": "Hang Clean",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "push_jerk",
    "name": "Push Jerk",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "split_jerk",
    "name": "Split Jerk",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "behind_the_neck_press",
    "name": "Behind-the-Neck Press",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Compound movement for shoulders and delts. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "landmine_lateral_raise",
    "name": "Landmine Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "plate_lateral_raise",
    "name": "Plate Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_front_raise",
    "name": "Cable Front Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_lateral_raise",
    "name": "Single-Arm Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bent_over_lateral_raise",
    "name": "Bent-Over Lateral Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "face_pull_external_rotation",
    "name": "Face Pull External Rotation",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "band_face_pull_2",
    "name": "Band Face Pull",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "wall_slide",
    "name": "Wall Slide",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "scapular_push_up",
    "name": "Scapular Push-Up",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "prone_t_raise",
    "name": "Prone T Raise",
    "muscle": "shoulders",
    "type": "strength",
    "description": "Targets shoulders and delts with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_rope_curl",
    "name": "Cable Rope Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_curl_drop_set",
    "name": "Machine Curl Drop Set",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "lying_cable_curl",
    "name": "Lying Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "high_cable_curl",
    "name": "High Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "low_cable_curl",
    "name": "Low Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "ez_bar_spider_curl",
    "name": "EZ-Bar Spider Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_preacher_curl",
    "name": "Dumbbell Preacher Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_preacher_curl",
    "name": "Single-Arm Preacher Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "reverse_grip_barbell_curl",
    "name": "Reverse Grip Barbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "fat_grip_curl",
    "name": "Fat-Grip Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tempo_barbell_curl",
    "name": "Tempo Barbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "paused_dumbbell_curl",
    "name": "Paused Dumbbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "kettlebell_curl",
    "name": "Kettlebell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "band_curl",
    "name": "Band Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "chin_up_supinated",
    "name": "Chin-Up Supinated",
    "muscle": "biceps",
    "type": "strength",
    "description": "Compound movement for biceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "ring_curl",
    "name": "Ring Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "wall_sit_curl",
    "name": "Wall Sit Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "incline_cable_curl",
    "name": "Incline Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "decline_dumbbell_curl",
    "name": "Decline Dumbbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "standing_alternating_curl",
    "name": "Standing Alternating Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cross_body_cable_curl",
    "name": "Cross-Body Cable Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "machine_hammer_curl",
    "name": "Machine Hammer Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "rope_hammer_curl_standing",
    "name": "Rope Hammer Curl Standing",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "strict_barbell_curl",
    "name": "Strict Barbell Curl",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cheat_curl_light",
    "name": "Cheat Curl Light",
    "muscle": "biceps",
    "type": "strength",
    "description": "Targets biceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "v_bar_pushdown",
    "name": "V-Bar Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "reverse_grip_pushdown",
    "name": "Reverse-Grip Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "single_arm_overhead_extension",
    "name": "Single-Arm Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "barbell_overhead_extension",
    "name": "Barbell Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "ez_bar_overhead_extension",
    "name": "EZ-Bar Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_skull_crusher",
    "name": "Cable Skull Crusher",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "decline_close_grip_press",
    "name": "Decline Close-Grip Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "floor_press_triceps",
    "name": "Floor Press Triceps",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "ring_tricep_extension",
    "name": "Ring Tricep Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "band_overhead_extension",
    "name": "Band Overhead Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dip_machine",
    "name": "Dip Machine",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "weighted_bench_dip",
    "name": "Weighted Bench Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "smith_close_grip_press",
    "name": "Smith Close-Grip Press",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "paused_skull_crusher",
    "name": "Paused Skull Crusher",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "rolling_tricep_extension",
    "name": "Rolling Tricep Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cross_body_extension",
    "name": "Cross-Body Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_kickback_overhead_combo",
    "name": "Cable Kickback Overhead Combo",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tricep_press_machine",
    "name": "Tricep Press Machine",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "single_arm_rope_extension",
    "name": "Single-Arm Rope Extension",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "bodyweight_bench_dip",
    "name": "Bodyweight Bench Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "pike_dip",
    "name": "Pike Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "parallel_bar_dip",
    "name": "Parallel Bar Dip",
    "muscle": "triceps",
    "type": "strength",
    "description": "Compound movement for triceps. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "tempo_pushdown",
    "name": "Tempo Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "explosive_pushdown",
    "name": "Explosive Pushdown",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "isometric_pushdown_hold",
    "name": "Isometric Pushdown Hold",
    "muscle": "triceps",
    "type": "strength",
    "description": "Targets triceps with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "high_bar_squat",
    "name": "High-Bar Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "low_bar_squat",
    "name": "Low-Bar Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "safety_bar_squat",
    "name": "Safety Bar Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "spanish_squat",
    "name": "Spanish Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "heel_elevated_squat",
    "name": "Heel-Elevated Squat",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "curtsy_lunge",
    "name": "Curtsy Lunge",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "lateral_lunge",
    "name": "Lateral Lunge",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "deficit_lunge",
    "name": "Deficit Lunge",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "walking_lunge_dumbbell",
    "name": "Walking Lunge Dumbbell",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "split_squat_jump",
    "name": "Split Squat Jump",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "leg_press_single_leg",
    "name": "Leg Press Single Leg",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hack_squat_narrow",
    "name": "Hack Squat Narrow",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "hack_squat_wide",
    "name": "Hack Squat Wide",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "copenhagen_plank",
    "name": "Copenhagen Plank",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "terminal_knee_extension",
    "name": "Terminal Knee Extension",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tibialis_raise",
    "name": "Tibialis Raise",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_leg_rdl",
    "name": "Single-Leg RDL",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "stiff_leg_deadlift",
    "name": "Stiff-Leg Deadlift",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "good_morning_barbell",
    "name": "Good Morning Barbell",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "glute_ham_raise",
    "name": "Glute Ham Raise",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "reverse_hyperextension",
    "name": "Reverse Hyperextension",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "frog_pump",
    "name": "Frog Pump",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "banded_hip_thrust",
    "name": "Banded Hip Thrust",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "cable_pull_through",
    "name": "Cable Pull-Through",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "kettlebell_swing_legs",
    "name": "Kettlebell Swing Legs",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "sandbag_carry",
    "name": "Sandbag Carry",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "yoke_walk",
    "name": "Yoke Walk",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "farmers_walk",
    "name": "Farmers Walk",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "trap_bar_carry",
    "name": "Trap Bar Carry",
    "muscle": "legs",
    "type": "strength",
    "description": "Compound movement for legs and glutes. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "stair_sprint",
    "name": "Stair Sprint",
    "muscle": "legs",
    "type": "strength",
    "description": "Targets legs and glutes with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "weighted_plank",
    "name": "Weighted Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "rkc_plank",
    "name": "RKC Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "long_lever_plank",
    "name": "Long-Lever Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "stir_the_pot",
    "name": "Stir the Pot",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "suitcase_carry",
    "name": "Suitcase Carry",
    "muscle": "core",
    "type": "strength",
    "description": "Compound movement for core and midsection. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pallof_walkout",
    "name": "Pallof Walkout",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "anti_rotation_hold",
    "name": "Anti-Rotation Hold",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hanging_knee_raise",
    "name": "Hanging Knee Raise",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "captain_chair_raise",
    "name": "Captain Chair Raise",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "decline_leg_raise",
    "name": "Decline Leg Raise",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "medicine_ball_slam",
    "name": "Medicine Ball Slam",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "medicine_ball_twist",
    "name": "Medicine Ball Twist",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "landmine_rotation",
    "name": "Landmine Rotation",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "barbell_rollout",
    "name": "Barbell Rollout",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "slider_pike",
    "name": "Slider Pike",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "bear_crawl",
    "name": "Bear Crawl",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "dead_bug_hold",
    "name": "Dead Bug Hold",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "copenhagen_side_plank",
    "name": "Copenhagen Side Plank",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "side_bend_dumbbell",
    "name": "Side Bend Dumbbell",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "cable_side_bend",
    "name": "Cable Side Bend",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "hollow_rock",
    "name": "Hollow Rock",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "l_sit_hold",
    "name": "L-Sit Hold",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "flutter_kick",
    "name": "Flutter Kick",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "scissor_kick",
    "name": "Scissor Kick",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "plank_shoulder_tap",
    "name": "Plank Shoulder Tap",
    "muscle": "core",
    "type": "strength",
    "description": "Targets core and midsection with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "treadmill_intervals",
    "name": "Treadmill Intervals",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "outdoor_tempo_run",
    "name": "Outdoor Tempo Run",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "ruck_walk",
    "name": "Ruck Walk",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 4
  },
  {
    "slug": "power_walk",
    "name": "Power Walk",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 4
  },
  {
    "slug": "recumbent_bike",
    "name": "Recumbent Bike",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "air_bike_intervals",
    "name": "Air Bike Intervals",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "rowing_intervals",
    "name": "Rowing Intervals",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "ski_erg",
    "name": "Ski Erg",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "versaclimber",
    "name": "VersaClimber",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "jacob_s_ladder",
    "name": "Jacob's Ladder",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "agility_ladder",
    "name": "Agility Ladder",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "shuttle_runs",
    "name": "Shuttle Runs",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "suicides",
    "name": "Suicides",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "tabata_burpees",
    "name": "Tabata Burpees",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "tabata_bike",
    "name": "Tabata Bike",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "farmer_walk_cardio",
    "name": "Farmer Walk Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 4
  },
  {
    "slug": "bear_crawl_cardio",
    "name": "Bear Crawl Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "battle_rope_waves",
    "name": "Battle Rope Waves",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "battle_rope_slams",
    "name": "Battle Rope Slams",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "kettlebell_snatch_cardio",
    "name": "Kettlebell Snatch Cardio",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "jump_rope_double_unders",
    "name": "Jump Rope Double Unders",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "jump_rope_singles",
    "name": "Jump Rope Singles",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "stair_sprints",
    "name": "Stair Sprints",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "hill_sprints",
    "name": "Hill Sprints",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 10
  },
  {
    "slug": "pool_swim_laps",
    "name": "Pool Swim Laps",
    "muscle": "cardio",
    "type": "cardio",
    "description": "Cardio focused on cardiovascular endurance. Steady effort elevates heart rate and burns energy.",
    "default_duration_sec": 600,
    "met_value": 8
  },
  {
    "slug": "quadruped_rockback",
    "name": "Quadruped Rockback",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "thread_the_needle",
    "name": "Thread the Needle",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "open_book_stretch",
    "name": "Open Book Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "figure_four_stretch",
    "name": "Figure-Four Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "couch_stretch",
    "name": "Couch Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "frog_stretch",
    "name": "Frog Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "calf_stretch_wall",
    "name": "Calf Stretch Wall",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "t_spine_extension",
    "name": "T-Spine Extension",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "shoulder_cars",
    "name": "Shoulder CARs",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "hip_cars",
    "name": "Hip CARs",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "neck_mobility_circles",
    "name": "Neck Mobility Circles",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "scapular_wall_slide",
    "name": "Scapular Wall Slide",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "doorway_pec_stretch",
    "name": "Doorway Pec Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "lat_stretch_band",
    "name": "Lat Stretch Band",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "tricep_stretch_overhead",
    "name": "Tricep Stretch Overhead",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "wrist_flexor_stretch",
    "name": "Wrist Flexor Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "wrist_extensor_stretch",
    "name": "Wrist Extensor Stretch",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "adductor_rock",
    "name": "Adductor Rock",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "glute_stretch_seated",
    "name": "Glute Stretch Seated",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "standing_hamstring_hinge",
    "name": "Standing Hamstring Hinge",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "dynamic_leg_swing",
    "name": "Dynamic Leg Swing",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "arm_circles",
    "name": "Arm Circles",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "leg_swings_front",
    "name": "Leg Swings Front",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "inchworm",
    "name": "Inchworm",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "world_s_greatest_stretch_flow",
    "name": "World's Greatest Stretch Flow",
    "muscle": "mobility",
    "type": "mobility",
    "description": "Mobility work for joint mobility and flexibility. Improves range of motion and prepares you to train.",
    "default_duration_sec": 60,
    "met_value": 2.5
  },
  {
    "slug": "hammer_curl_across_body",
    "name": "Hammer Curl Across Body",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_reverse_curl",
    "name": "Cable Reverse Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "ez_drag_curl",
    "name": "EZ Drag Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "spider_hammer_curl",
    "name": "Spider Hammer Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "preacher_hammer_curl",
    "name": "Preacher Hammer Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "tricep_dip_assisted",
    "name": "Tricep Dip Assisted",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "close_grip_floor_press",
    "name": "Close-Grip Floor Press",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "jm_press_light",
    "name": "JM Press Light",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "overhead_rope_extension_kneeling",
    "name": "Overhead Rope Extension Kneeling",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_tricep_kickback",
    "name": "Cable Tricep Kickback",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dumbbell_overhead_tricep",
    "name": "Dumbbell Overhead Tricep",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "ez_close_grip_press",
    "name": "EZ Close-Grip Press",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "pin_press_triceps",
    "name": "Pin Press Triceps",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "zottman_preacher_curl",
    "name": "Zottman Preacher Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "cable_21s",
    "name": "Cable 21s",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "machine_tricep_dip",
    "name": "Machine Tricep Dip",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "rope_overhead_extension",
    "name": "Rope Overhead Extension",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "single_arm_dip",
    "name": "Single-Arm Dip",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "band_curl_drop",
    "name": "Band Curl Drop",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "fat_bar_curl",
    "name": "Fat Bar Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "wrist_roller",
    "name": "Wrist Roller",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "slug": "reverse_ez_curl",
    "name": "Reverse EZ Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "standing_tricep_stretch_press",
    "name": "Standing Tricep Stretch Press",
    "muscle": "arms",
    "type": "strength",
    "description": "Compound movement for arms. Builds strength through a full, controlled range.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 6
  },
  {
    "slug": "landmine_curl",
    "name": "Landmine Curl",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10,
    "met_value": 4.5
  },
  {
    "slug": "dual_rope_pushdown",
    "name": "Dual Rope Pushdown",
    "muscle": "arms",
    "type": "strength",
    "description": "Targets arms with focused reps. Keep form tight and move with control.",
    "default_sets": 3,
    "default_reps": 10
  }
] as CatalogExercise[];

export const ROUTINE_TEMPLATES = [
  {
    id: "push",
    name: "Push day",
    slugs: [
      "barbell_bench_press",
      "incline_dumbbell_press",
      "overhead_press",
      "lateral_raise",
      "tricep_pushdown",
      "cable_fly",
    ],
  },
  {
    id: "pull",
    name: "Pull day",
    slugs: ["barbell_deadlift", "barbell_row", "lat_pulldown", "face_pull", "barbell_curl", "hammer_curl"],
  },
  {
    id: "legs",
    name: "Leg day",
    slugs: [
      "back_squat",
      "romanian_deadlift",
      "leg_press",
      "bulgarian_split_squat",
      "leg_curl",
      "standing_calf_raise",
    ],
  },
  {
    id: "full",
    name: "Full body",
    slugs: ["back_squat", "barbell_bench_press", "barbell_row", "overhead_press", "plank"],
  },
  {
    id: "upper",
    name: "Upper body",
    slugs: [
      "barbell_bench_press",
      "barbell_row",
      "dumbbell_shoulder_press",
      "lat_pulldown",
      "barbell_curl",
      "tricep_pushdown",
    ],
  },
  {
    id: "cardio",
    name: "Cardio",
    slugs: ["treadmill_run", "stationary_bike", "rowing_machine", "jump_rope", "elliptical"],
  },
] as const;

export function catalogBySlug(slug: string): CatalogExercise | undefined {
  return EXERCISE_CATALOG.find((e) => e.slug === slug);
}
