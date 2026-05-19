import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "lib", "exerciseCatalog.ts");

const muscles = {
  chest: [
    "Barbell Bench Press", "Dumbbell Bench Press", "Incline Barbell Bench Press", "Incline Dumbbell Press",
    "Decline Bench Press", "Machine Chest Press", "Cable Fly", "Dumbbell Fly", "Pec Deck", "Push-Up",
    "Wide Push-Up", "Diamond Push-Up", "Chest Dip", "Landmine Press", "Floor Press", "Svend Press",
    "Cable Crossover", "Low Cable Fly", "High Cable Fly", "Single-Arm Dumbbell Press", "Hammer Strength Press",
    "Plate Press", "Resistance Band Press", "Isometric Chest Hold", "Paused Bench Press",
  ],
  back: [
    "Barbell Row", "Pendlay Row", "Dumbbell Row", "Single-Arm Dumbbell Row", "T-Bar Row", "Cable Row",
    "Seated Cable Row", "Lat Pulldown", "Wide-Grip Pulldown", "Close-Grip Pulldown", "Pull-Up", "Chin-Up",
    "Neutral-Grip Pull-Up", "Assisted Pull-Up", "Face Pull", "Straight-Arm Pulldown", "Meadows Row",
    "Chest-Supported Row", "Machine Row", "Inverted Row", "Barbell Deadlift", "Romanian Deadlift", "Sumo Deadlift",
    "Trap Bar Deadlift", "Good Morning", "Back Extension", "Hyperextension", "Cable Pullover", "Kroc Row", "Seal Row",
  ],
  shoulders: [
    "Overhead Press", "Barbell Push Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press",
    "Lateral Raise", "Cable Lateral Raise", "Front Raise", "Rear Delt Fly", "Cable Rear Delt Fly", "Upright Row",
    "Barbell Shrug", "Dumbbell Shrug", "Cable Shrug", "Bradford Press", "Landmine Shoulder Press", "Plate Front Raise",
    "Band Pull-Apart", "Y Raise", "W Raise", "Cuban Press", "Scaption Raise", "Kettlebell Press",
    "Handstand Push-Up", "Pike Push-Up",
  ],
  biceps: [
    "Barbell Curl", "EZ-Bar Curl", "Dumbbell Curl", "Hammer Curl", "Incline Dumbbell Curl", "Preacher Curl",
    "Machine Preacher Curl", "Cable Curl", "Concentration Curl", "Spider Curl", "Bayesian Curl", "Drag Curl",
    "Reverse Curl", "Zottman Curl", "21s Curl", "Cross-Body Hammer Curl", "Cable Hammer Curl", "Rope Hammer Curl",
    "Chin-Up Biceps Focus", "Isometric Curl Hold",
  ],
  triceps: [
    "Tricep Pushdown", "Rope Pushdown", "Overhead Tricep Extension", "Dumbbell Skull Crusher", "EZ Skull Crusher",
    "Close-Grip Bench Press", "Tricep Dip", "Bench Dip", "Kickback", "Single-Arm Pushdown", "JM Press", "Tate Press",
    "Cable Overhead Extension", "Diamond Push-Up Triceps", "French Press", "Machine Tricep Extension", "Band Pushdown",
    "Floor Press Close Grip", "Dumbbell Overhead Extension", "Bodyweight Tricep Extension",
  ],
  legs: [
    "Back Squat", "Front Squat", "Goblet Squat", "Hack Squat", "Leg Press", "Bulgarian Split Squat", "Walking Lunge",
    "Reverse Lunge", "Leg Extension", "Leg Curl", "Seated Leg Curl", "Romanian Deadlift Legs", "Hip Thrust",
    "Glute Bridge", "Cable Kickback", "Step-Up", "Box Squat", "Pause Squat", "Sumo Squat", "Sissy Squat",
    "Nordic Curl", "Standing Calf Raise", "Seated Calf Raise", "Donkey Calf Raise", "Smith Machine Squat", "Belt Squat",
    "Pistol Squat", "Wall Sit", "Adductor Machine", "Abductor Machine", "Hip Abduction", "Hip Adduction",
    "Landmine Squat", "Jefferson Squat", "Zercher Squat",
  ],
  core: [
    "Plank", "Side Plank", "Crunch", "Bicycle Crunch", "Hanging Leg Raise", "Lying Leg Raise", "Cable Crunch",
    "Ab Wheel Rollout", "Russian Twist", "Mountain Climber", "Dead Bug", "Bird Dog", "Pallof Press", "Wood Chop",
    "Toes to Bar", "V-Up", "Sit-Up", "Decline Sit-Up", "Hollow Hold", "Farmer Walk Core", "Turkish Get-Up",
    "Windshield Wiper", "Dragon Flag", "Cable Woodchop", "Machine Crunch",
  ],
  cardio: [
    "Treadmill Run", "Outdoor Run", "Walking", "Incline Walk", "Stationary Bike", "Spin Bike", "Rowing Machine",
    "Elliptical", "Stair Climber", "Jump Rope", "Battle Ropes", "Assault Bike", "Swimming", "Cycling", "HIIT Sprints",
    "Burpees", "Jumping Jacks", "Box Jumps", "Kettlebell Swing Cardio", "Sled Push", "Sled Pull", "Prowler Push",
    "Shadow Boxing", "Jump Squat Cardio", "Mountain Climber Cardio",
  ],
  mobility: [
    "Cat-Cow", "World Greatest Stretch", "Hip Flexor Stretch", "Hamstring Stretch", "Shoulder Dislocates",
    "Thoracic Rotation", "Ankle Mobility", "Wrist Circles", "Foam Roll Quads", "Foam Roll Back", "Pigeon Pose",
    "Child Pose", "Downward Dog", "Band Pull-Apart Mobility", "90-90 Hip",
  ],
  arms: [
    "Cable Biceps Curl", "Machine Curl", "Tricep Rope Extension", "Single-Arm Cable Curl", "Bench Pin Press",
    "Floor Skull Crusher", "Overhead Cable Extension", "Wrist Curl", "Reverse Wrist Curl", "Farmer Carry",
    "Pinwheel Curl", "Cable Kickback Triceps", "Dumbbell Kickback", "Close-Grip Push-Up", "Chin-Up Narrow",
    "Neutral Grip Chin", "EZ-Bar Preacher Curl", "Machine Dip", "Weighted Dip", "Band Tricep Extension",
    "Incline Hammer Curl", "Decline Tricep Extension", "Cable Concentration Curl", "Smith Machine Curl",
    "Landmine Row Single Arm", "Chest Press Machine Incline", "Push Press Light", "Muscle-Up", "Ring Dip",
    "Band Face Pull",
  ],
};

const extraMuscles = {
  chest: [
    "Guillotine Press", "Neutral-Grip Bench Press", "Feet-Up Bench Press", "Spoto Press", "Board Press",
    "Reverse-Grip Bench Press", "Squeeze Press", "Around the World", "Cable Press Around", "Standing Cable Press",
    "Incline Cable Fly", "Decline Dumbbell Fly", "Machine Fly", "Resistance Band Fly", "Push-Up on Handles",
    "Archer Push-Up", "Clap Push-Up", "Weighted Push-Up", "Ring Push-Up", "Landmine Chest Press",
    "Single-Arm Cable Press", "Kettlebell Floor Press", "Smith Incline Press", "Smith Decline Press", "Paused Fly",
  ],
  back: [
    "Renegade Row", "Yates Row", "Underhand Barbell Row", "Wide-Grip Barbell Row", "Snatch-Grip Deadlift",
    "Deficit Deadlift", "Block Pull", "Rack Pull", "Single-Arm Cable Row", "Iso-Lateral Row",
    "Hammer Strength High Row", "Hammer Strength Low Row", "Rope Straight-Arm Pulldown", "Band-Assisted Pull-Up",
    "Weighted Pull-Up", "Lat Pullover Machine", "Dumbbell Pullover", "Barbell Pullover", "Reverse Hyper",
    "45-Degree Back Extension", "Bird Dog Row", "Batwing Row", "Chest-Supported T-Bar Row", "Landmine Row",
    "Bent-Over Cable Row",
  ],
  shoulders: [
    "Seated Overhead Press", "Z-Press", "Viking Press", "Bottoms-Up Kettlebell Press", "Half-Kneeling Press",
    "Lu Raise", "Leaning Lateral Raise", "Cable Y-Raise", "Prone Rear Delt Raise", "Reverse Pec Deck",
    "Snatch-Grip High Pull", "Hang Clean", "Push Jerk", "Split Jerk", "Behind-the-Neck Press",
    "Landmine Lateral Raise", "Plate Lateral Raise", "Cable Front Raise", "Single-Arm Lateral Raise",
    "Bent-Over Lateral Raise", "Face Pull External Rotation", "Band Face Pull", "Wall Slide", "Scapular Push-Up",
    "Prone T Raise",
  ],
  biceps: [
    "Cable Rope Curl", "Machine Curl Drop Set", "Lying Cable Curl", "High Cable Curl", "Low Cable Curl",
    "EZ-Bar Spider Curl", "Dumbbell Preacher Curl", "Single-Arm Preacher Curl", "Reverse Grip Barbell Curl",
    "Fat-Grip Curl", "Tempo Barbell Curl", "Paused Dumbbell Curl", "Kettlebell Curl", "Band Curl",
    "Chin-Up Supinated", "Ring Curl", "Wall Sit Curl", "Incline Cable Curl", "Decline Dumbbell Curl",
    "Standing Alternating Curl", "Cross-Body Cable Curl", "Machine Hammer Curl", "Rope Hammer Curl Standing",
    "Strict Barbell Curl", "Cheat Curl Light",
  ],
  triceps: [
    "V-Bar Pushdown", "Reverse-Grip Pushdown", "Single-Arm Overhead Extension", "Barbell Overhead Extension",
    "EZ-Bar Overhead Extension", "Cable Skull Crusher", "Decline Close-Grip Press", "Floor Press Triceps",
    "Ring Tricep Extension", "Band Overhead Extension", "Dip Machine", "Weighted Bench Dip", "Smith Close-Grip Press",
    "Paused Skull Crusher", "Rolling Tricep Extension", "Cross-Body Extension", "Cable Kickback Overhead Combo",
    "Tricep Press Machine", "Single-Arm Rope Extension", "Bodyweight Bench Dip", "Pike Dip", "Parallel Bar Dip",
    "Tempo Pushdown", "Explosive Pushdown", "Isometric Pushdown Hold",
  ],
  legs: [
    "High-Bar Squat", "Low-Bar Squat", "Safety Bar Squat", "Spanish Squat", "Heel-Elevated Squat",
    "Curtsy Lunge", "Lateral Lunge", "Deficit Lunge", "Walking Lunge Dumbbell", "Split Squat Jump",
    "Leg Press Single Leg", "Hack Squat Narrow", "Hack Squat Wide", "Copenhagen Plank", "Terminal Knee Extension",
    "Tibialis Raise", "Single-Leg RDL", "Stiff-Leg Deadlift", "Good Morning Barbell", "Glute Ham Raise",
    "Reverse Hyperextension", "Frog Pump", "Banded Hip Thrust", "Cable Pull-Through", "Kettlebell Swing Legs",
    "Sandbag Carry", "Yoke Walk", "Farmers Walk", "Trap Bar Carry", "Stair Sprint",
  ],
  core: [
    "Weighted Plank", "RKC Plank", "Long-Lever Plank", "Stir the Pot", "Suitcase Carry",
    "Pallof Walkout", "Anti-Rotation Hold", "Hanging Knee Raise", "Captain Chair Raise", "Decline Leg Raise",
    "Medicine Ball Slam", "Medicine Ball Twist", "Landmine Rotation", "Barbell Rollout", "Slider Pike",
    "Bear Crawl", "Dead Bug Hold", "Copenhagen Side Plank", "Side Bend Dumbbell", "Cable Side Bend",
    "Hollow Rock", "L-Sit Hold", "Flutter Kick", "Scissor Kick", "Plank Shoulder Tap",
  ],
  cardio: [
    "Treadmill Intervals", "Outdoor Tempo Run", "Ruck Walk", "Power Walk", "Recumbent Bike",
    "Air Bike Intervals", "Rowing Intervals", "Ski Erg", "VersaClimber", "Jacob's Ladder",
    "Agility Ladder", "Shuttle Runs", "Suicides", "Tabata Burpees", "Tabata Bike",
    "Farmer Walk Cardio", "Bear Crawl Cardio", "Battle Rope Waves", "Battle Rope Slams", "Kettlebell Snatch Cardio",
    "Jump Rope Double Unders", "Jump Rope Singles", "Stair Sprints", "Hill Sprints", "Pool Swim Laps",
  ],
  mobility: [
    "Quadruped Rockback", "Thread the Needle", "Open Book Stretch", "Figure-Four Stretch", "Couch Stretch",
    "Frog Stretch", "Calf Stretch Wall", "T-Spine Extension", "Shoulder CARs", "Hip CARs",
    "Neck Mobility Circles", "Scapular Wall Slide", "Doorway Pec Stretch", "Lat Stretch Band", "Tricep Stretch Overhead",
    "Wrist Flexor Stretch", "Wrist Extensor Stretch", "Adductor Rock", "Glute Stretch Seated", "Standing Hamstring Hinge",
    "Dynamic Leg Swing", "Arm Circles", "Leg Swings Front", "Inchworm", "World's Greatest Stretch Flow",
  ],
  arms: [
    "Hammer Curl Across Body", "Cable Reverse Curl", "EZ Drag Curl", "Spider Hammer Curl", "Preacher Hammer Curl",
    "Tricep Dip Assisted", "Close-Grip Floor Press", "JM Press Light", "Overhead Rope Extension Kneeling",
    "Cable Tricep Kickback", "Dumbbell Overhead Tricep", "EZ Close-Grip Press", "Pin Press Triceps",
    "Zottman Preacher Curl", "Cable 21s", "Machine Tricep Dip", "Rope Overhead Extension", "Single-Arm Dip",
    "Band Curl Drop", "Fat Bar Curl", "Wrist Roller", "Reverse EZ Curl", "Standing Tricep Stretch Press",
    "Landmine Curl", "Dual Rope Pushdown",
  ],
};

const MUSCLE_FOCUS = {
  chest: "chest and pressing muscles",
  back: "back and lats",
  shoulders: "shoulders and delts",
  biceps: "biceps",
  triceps: "triceps",
  legs: "legs and glutes",
  core: "core and midsection",
  cardio: "cardiovascular endurance",
  mobility: "joint mobility and flexibility",
  arms: "arms",
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function exerciseType(muscle) {
  if (muscle === "cardio") return "cardio";
  if (muscle === "mobility") return "mobility";
  return "strength";
}

function describe(name, muscle, type) {
  const focus = MUSCLE_FOCUS[muscle] ?? muscle;
  if (type === "cardio") {
    return `Cardio focused on ${focus}. Steady effort elevates heart rate and burns energy.`;
  }
  if (type === "mobility") {
    return `Mobility work for ${focus}. Improves range of motion and prepares you to train.`;
  }
  const compound =
    /squat|deadlift|press|row|pull-up|chin-up|lunge|thrust|dip|clean|jerk|carry|swing/i.test(name);
  if (compound) {
    return `Compound movement for ${focus}. Builds strength through a full, controlled range.`;
  }
  return `Targets ${focus} with focused reps. Keep form tight and move with control.`;
}

function metValue(name, type) {
  if (type === "mobility") return 2.5;
  if (type === "cardio") {
    if (/hiit|sprint|burpee|tabata|assault|battle|jump|box|prowler|sled/i.test(name)) return 10;
    if (/walk|stretch|mobility/i.test(name)) return 4;
    return 8;
  }
  if (/deadlift|squat|clean|jerk|thrust|carry|press|row|pull-up|chin-up/i.test(name)) return 6;
  if (/curl|raise|fly|extension|kickback|crunch|plank/i.test(name)) return 4.5;
  return undefined;
}

function defaultsFor(type) {
  if (type === "cardio") return { default_duration_sec: 600 };
  if (type === "mobility") return { default_duration_sec: 60 };
  return { default_sets: 3, default_reps: 10 };
}

const seenSlugs = new Set();
const out = [];

function addExercise(muscle, name) {
  let slug = slugify(name);
  if (seenSlugs.has(slug)) {
    let n = 2;
    while (seenSlugs.has(`${slug}_${n}`)) n += 1;
    slug = `${slug}_${n}`;
  }
  seenSlugs.add(slug);
  const type = exerciseType(muscle);
  const met = metValue(name, type);
  const entry = {
    slug,
    name,
    muscle,
    type,
    description: describe(name, muscle, type),
    ...defaultsFor(type),
  };
  if (met != null) entry.met_value = met;
  out.push(entry);
}

for (const [muscle, names] of Object.entries(muscles)) {
  for (const name of names) addExercise(muscle, name);
}
for (const [muscle, names] of Object.entries(extraMuscles)) {
  for (const name of names) addExercise(muscle, name);
}

const header = `export type Muscle =
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

export const EXERCISE_CATALOG: CatalogExercise[] = `;

const footer = ` as CatalogExercise[];

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
`;

fs.writeFileSync(outPath, header + JSON.stringify(out, null, 2) + footer);
console.log("Wrote", out.length, "exercises to", outPath);
