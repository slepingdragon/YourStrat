from typing import Literal

from pydantic import BaseModel, Field

Units = Literal["metric", "imperial"]
Sex = Literal["male", "female"]
ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
Goal = Literal["lose", "maintain", "gain"]
ExerciseType = Literal["strength", "cardio", "mobility"]


class OnboardingInput(BaseModel):
    units: Units
    weight_kg: float = Field(gt=0)
    height_cm: float = Field(gt=0)
    age: int = Field(ge=13, le=120)
    sex: Sex
    activity_level: ActivityLevel
    goal: Goal


class ProfileUpdate(BaseModel):
    units: Units | None = None
    weight_kg: float | None = Field(default=None, gt=0)
    height_cm: float | None = Field(default=None, gt=0)
    age: int | None = Field(default=None, ge=13, le=120)
    sex: Sex | None = None
    activity_level: ActivityLevel | None = None
    goal: Goal | None = None


class TrialStatus(BaseModel):
    trial_active: bool
    days_remaining: int
    scans_today: int
    scans_limit: int
    is_admin: bool = False


class Profile(BaseModel):
    id: str
    units: Units
    weight_kg: float
    height_cm: float
    age: int
    sex: Sex
    activity_level: ActivityLevel
    goal: Goal
    daily_calorie_target: int
    daily_protein_target_g: int
    daily_carbs_target_g: int
    daily_fat_target_g: int
    trial: TrialStatus


class AiStats(BaseModel):
    total_scans: int
    scans_this_week: int
    avg_confidence: float | None = None
    low_confidence_count: int
    accuracy_note: str


class MealItemInput(BaseModel):
    name: str
    portion: str | None = None
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: int = 0
    confidence: float | None = None


class MealCreate(BaseModel):
    photo_url: str | None = None
    items: list[MealItemInput]


class MealItemOut(MealItemInput):
    id: str


class MealOut(BaseModel):
    id: str
    photo_url: str | None
    scanned_at: str
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    total_sugar_g: float
    total_sodium_mg: int
    items: list[MealItemOut] = []


class ExerciseCreate(BaseModel):
    name: str
    type: ExerciseType
    met_value: float | None = None
    default_sets: int | None = None
    default_reps: int | None = None
    default_duration_sec: int | None = None


class ExerciseOut(ExerciseCreate):
    id: str
    met_value: float


class RoutineExerciseInput(BaseModel):
    exercise_id: str
    position: int
    sets: int | None = None
    reps: int | None = None
    duration_sec: int | None = None
    rest_sec: int | None = None


class RoutineCreate(BaseModel):
    name: str
    exercises: list[RoutineExerciseInput]
    scheduled_days: list[int] = Field(default_factory=list)


class RoutineExerciseOut(RoutineExerciseInput):
    exercise: ExerciseOut | None = None


class RoutineOut(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    exercises: list[RoutineExerciseOut] = []
    scheduled_days: list[int] = []
    exercise_count: int = 0


class SessionStart(BaseModel):
    routine_id: str | None = None
    planned_rpe: int | None = Field(default=None, ge=1, le=10)


class SessionFinish(BaseModel):
    actual_rpe: int | None = Field(default=None, ge=1, le=10)


class SessionSetInput(BaseModel):
    exercise_id: str
    position: int
    reps: int | None = None
    weight_kg: float | None = None
    duration_sec: int | None = None


class SessionOut(BaseModel):
    id: str
    routine_id: str | None
    started_at: str
    ended_at: str | None = None
    duration_sec: int | None = None
    calories_burned: int = 0
    planned_rpe: int | None = None
    actual_rpe: int | None = None


class NutritionDayTotals(BaseModel):
    calories: int = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: int = 0


class NutritionDay(BaseModel):
    date: str
    meals: list[MealOut] = []
    totals: NutritionDayTotals


class NutritionJournal(BaseModel):
    days: list[NutritionDay] = []


class ActiveSessionInfo(BaseModel):
    id: str
    routine_id: str | None
    routine_name: str | None
    started_at: str


class CompletedSessionInfo(BaseModel):
    id: str
    routine_id: str | None
    routine_name: str | None
    duration_sec: int | None
    calories_burned: int


class ScheduledRoutineInfo(BaseModel):
    id: str
    name: str


class TodaySnapshot(BaseModel):
    targets: Profile
    consumed_calories: int = 0
    consumed_protein_g: float = 0
    consumed_carbs_g: float = 0
    consumed_fat_g: float = 0
    consumed_fiber_g: float = 0
    consumed_sugar_g: float = 0
    consumed_sodium_mg: int = 0
    burned_calories: int = 0
    remaining_calories: int = 0
    net_calories: int = 0
    callouts: list[str] = []
    meals: list[MealOut] = []
    active_session: ActiveSessionInfo | None = None
    last_completed_session_today: CompletedSessionInfo | None = None
    scheduled_routine_today: ScheduledRoutineInfo | None = None
