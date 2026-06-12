import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitLogs, habits } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** Increment/decrement (or set) a habit's count for a date. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const habitId = Number(id);
  const body = await req.json();
  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }
  const habitRows = await db.select().from(habits).where(eq(habits.id, habitId));
  if (!habitRows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const habit = habitRows[0];

  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)));

  let count: number;
  if (body.set != null) {
    count = Number(body.set);
  } else {
    const delta = Number(body.delta ?? 1);
    count = (existing[0]?.count ?? 0) + delta;
  }
  count = Math.max(0, Math.min(habit.targetPerDay, count));

  if (existing.length) {
    await db.update(habitLogs).set({ count }).where(eq(habitLogs.id, existing[0].id));
  } else {
    await db.insert(habitLogs).values({ habitId, date, count });
  }
  return NextResponse.json({ habitId, date, count, completed: count >= habit.targetPerDay });
}
