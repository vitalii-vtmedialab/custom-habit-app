import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitLogs, habits, sessions, strengthGoals, strengthSessions } from "@/lib/schema";
import { getProfile } from "@/lib/server";
import { addDays, weekStart } from "@/lib/dates";

export const dynamic = "force-dynamic";

/** Consecutive completed days ending today (or yesterday if today incomplete). */
function calcStreak(completedDates: Set<string>, today: string): number {
  let streak = 0;
  let cursor = completedDates.has(today) ? today : addDays(today, -1);
  while (completedDates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function GET(req: NextRequest) {
  const today = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    return NextResponse.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 });
  }
  const lookback = addDays(today, -120);
  const wkStart = weekStart(today);
  const wkEnd = addDays(wkStart, 6);

  const [prof, recentSessions, activeHabits, recentLogs, weekStrength, goalRows] =
    await Promise.all([
      getProfile(),
      db
        .select()
        .from(sessions)
        .where(and(gte(sessions.date, lookback), lte(sessions.date, today)))
        .orderBy(desc(sessions.date), desc(sessions.id)),
      db.select().from(habits).where(eq(habits.archived, false)).orderBy(habits.sort, habits.id),
      db
        .select()
        .from(habitLogs)
        .where(and(gte(habitLogs.date, lookback), lte(habitLogs.date, today))),
      db
        .select()
        .from(strengthSessions)
        .where(and(gte(strengthSessions.date, wkStart), lte(strengthSessions.date, wkEnd))),
      db
        .select()
        .from(strengthGoals)
        .where(lte(strengthGoals.weekStart, wkStart))
        .orderBy(desc(strengthGoals.weekStart), desc(strengthGoals.id))
        .limit(1),
    ]);

  // Today's treadmill totals
  const todaySessions = recentSessions.filter((s) => s.date === today);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const steps = sum(todaySessions.map((s) => s.steps));
  const calories = sum(todaySessions.map((s) => s.calories));
  const distanceMi = Math.round(sum(todaySessions.map((s) => s.distanceMi)) * 100) / 100;
  const walkMin = Math.round(sum(todaySessions.map((s) => s.durationMin)));

  // Step-goal streak from daily step totals
  const dailySteps = new Map<string, number>();
  for (const s of recentSessions) {
    dailySteps.set(s.date, (dailySteps.get(s.date) ?? 0) + s.steps);
  }
  const stepDone = new Set<string>();
  for (const [d, v] of dailySteps) if (v >= prof.stepGoal) stepDone.add(d);
  const stepStreak = calcStreak(stepDone, today);

  // Habits visible today (started, not ended) + today counts + streaks
  const logsByHabit = new Map<number, Map<string, number>>();
  for (const log of recentLogs) {
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, new Map());
    logsByHabit.get(log.habitId)!.set(log.date, log.count);
  }
  const visibleHabits = activeHabits
    .filter((h) => h.startDate <= today && (!h.endDate || h.endDate >= today))
    .map((h) => {
      const logs = logsByHabit.get(h.id) ?? new Map<string, number>();
      const completed = new Set<string>();
      for (const [d, c] of logs) if (c >= h.targetPerDay) completed.add(d);
      return {
        ...h,
        todayCount: logs.get(today) ?? 0,
        streak: calcStreak(completed, today),
      };
    });

  return NextResponse.json({
    date: today,
    profile: prof,
    steps,
    calories,
    distanceMi,
    walkMin,
    sessions: todaySessions,
    habits: visibleHabits,
    stepStreak,
    strength: {
      target: goalRows[0]?.target ?? 3,
      doneThisWeek: weekStrength.length,
      todaySessions: weekStrength.filter((s) => s.date === today),
    },
  });
}
