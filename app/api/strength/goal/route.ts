import { NextRequest, NextResponse } from "next/server";
import { desc, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { strengthGoals } from "@/lib/schema";
import { todayKey, weekStart } from "@/lib/dates";

export const dynamic = "force-dynamic";

/**
 * Effective goal for the week containing ?date (default today).
 * ?history=1 returns all goal rows so clients can compute per-week
 * historical targets (past weeks keep the goal effective at the time).
 */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("history") === "1") {
    const all = await db
      .select()
      .from(strengthGoals)
      .orderBy(strengthGoals.weekStart, strengthGoals.id);
    return NextResponse.json(all);
  }
  const date = req.nextUrl.searchParams.get("date") ?? todayKey();
  const wk = weekStart(date);
  const rows = await db
    .select()
    .from(strengthGoals)
    .where(lte(strengthGoals.weekStart, wk))
    .orderBy(desc(strengthGoals.weekStart), desc(strengthGoals.id))
    .limit(1);
  return NextResponse.json({ weekStart: wk, target: rows[0]?.target ?? 3 });
}

/**
 * Set goal effective from the current week forward.
 * Past weeks keep whatever goal row was effective for them.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const target = Math.max(0, Math.min(14, Number(body.target)));
  if (!Number.isFinite(target)) {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }
  const wk = weekStart(todayKey());
  const existing = await db.select().from(strengthGoals).where(eq(strengthGoals.weekStart, wk));
  if (existing.length) {
    await db.update(strengthGoals).set({ target }).where(eq(strengthGoals.id, existing[0].id));
  } else {
    await db.insert(strengthGoals).values({ weekStart: wk, target });
  }
  return NextResponse.json({ weekStart: wk, target });
}
