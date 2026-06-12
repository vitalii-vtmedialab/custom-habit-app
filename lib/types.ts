/** Shared client-side types mirroring API payloads. */

export interface Profile {
  id: number;
  heightIn: number;
  birthYear: number;
  gender: string;
  stepGoal: number;
  calorieGoal: number;
  fallbackWeightLb: number;
}

export interface Session {
  id: number;
  date: string;
  durationMin: number;
  speedMph: number;
  steps: number;
  distanceMi: number;
  calories: number;
}

export interface Weighin {
  id: number;
  date: string;
  weightLb: number;
  neckIn: number | null;
  chestIn: number | null;
  bellyIn: number | null;
  armIn: number | null;
  note: string | null;
  photoIds: number[];
}

export interface Habit {
  id: number;
  name: string;
  type: "check" | "quantity";
  targetPerDay: number;
  icon: string;
  color: string;
  startDate: string;
  endDate: string | null;
  archived: boolean;
  sort: number;
}

export interface HabitWithToday extends Habit {
  todayCount: number;
  streak: number;
}

export interface StrengthSession {
  id: number;
  date: string;
  durationMin: number;
  location: "home" | "gym";
}

export interface TodayData {
  date: string;
  profile: Profile;
  steps: number;
  calories: number;
  distanceMi: number;
  walkMin: number;
  sessions: Session[];
  habits: HabitWithToday[];
  stepStreak: number;
  strength: {
    target: number;
    doneThisWeek: number;
    todaySessions: StrengthSession[];
  };
}
