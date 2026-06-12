import {
  pgTable,
  serial,
  integer,
  real,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/** Single-row profile + global goals. Always id = 1. */
export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  heightIn: real("height_in").notNull().default(70),
  birthYear: integer("birth_year").notNull().default(1990),
  gender: text("gender").notNull().default("male"), // 'male' | 'female'
  stepGoal: integer("step_goal").notNull().default(10000),
  calorieGoal: integer("calorie_goal").notNull().default(400),
  /** Fallback weight (lb) used before the first weigh-in exists. */
  fallbackWeightLb: real("fallback_weight_lb").notNull().default(180),
});

/** Treadmill walking sessions. date = local 'YYYY-MM-DD'. */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  durationMin: real("duration_min").notNull(),
  speedMph: real("speed_mph").notNull(),
  steps: integer("steps").notNull(),
  distanceMi: real("distance_mi").notNull(),
  calories: integer("calories").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Weekly weigh-ins with optional measurements (inches). */
export const weighins = pgTable("weighins", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  weightLb: real("weight_lb").notNull(),
  neckIn: real("neck_in"),
  chestIn: real("chest_in"),
  bellyIn: real("belly_in"),
  armIn: real("arm_in"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Progress photos in a private Vercel Blob store; served via authed proxy. */
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  weighinId: integer("weighin_id")
    .notNull()
    .references(() => weighins.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  pathname: text("pathname").notNull().default(""),
  contentType: text("content_type").notNull().default("image/jpeg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * User-defined habits.
 * type: 'check' (once a day) | 'quantity' (N times a day, e.g. 3 pills)
 * endDate set => habit auto-archives after that date (e.g. 4-week course).
 */
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("check"),
  targetPerDay: integer("target_per_day").notNull().default(1),
  icon: text("icon").notNull().default("circle-check"),
  color: text("color").notNull().default("#007AFF"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  archived: boolean("archived").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** One row per habit per day. count accumulates for quantity habits. */
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  count: integer("count").notNull().default(0),
});

/** Strength training sessions: duration + where. */
export const strengthSessions = pgTable("strength_sessions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  durationMin: integer("duration_min").notNull(),
  location: text("location").notNull().default("home"), // 'home' | 'gym'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Weekly strength goal history. weekStart = Monday 'YYYY-MM-DD'.
 * The goal effective for any week is the row with the greatest
 * weekStart <= that week's Monday. Past weeks keep their historical goal.
 */
export const strengthGoals = pgTable("strength_goals", {
  id: serial("id").primaryKey(),
  weekStart: text("week_start").notNull(),
  target: integer("target").notNull().default(3),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
