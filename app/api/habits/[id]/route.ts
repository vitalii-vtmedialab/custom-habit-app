import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitLogs, habits } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** GET habit + logs for a date range (calendar/streak view). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const habitId = Number(id);
  const from = req.nextUrl.searchParams.get("from") ?? "1970-01-01";
  const to = req.nextUrl.searchParams.get("to") ?? "2999-12-31";
  const [habitRows, logs] = await Promise.all([
    db.select().from(habits).where(eq(habits.id, habitId)),
    db
      .select()
      .from(habitLogs)
      .where(
        and(eq(habitLogs.habitId, habitId), gte(habitLogs.date, from), lte(habitLogs.date, to))
      ),
  ]);
  if (!habitRows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ habit: habitRows[0], logs });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.archived === "boolean") patch.archived = body.archived;
  if (typeof body.color === "string") patch.color = body.color;
  if (typeof body.icon === "string") patch.icon = body.icon;
  if (body.targetPerDay != null) patch.targetPerDay = Math.max(1, Math.min(50, Number(body.targetPerDay) || 1));
  if (body.endDate === null || /^\d{4}-\d{2}-\d{2}$/.test(body.endDate)) patch.endDate = body.endDate;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const updated = await db.update(habits).set(patch).where(eq(habits.id, Number(id))).returning();
  return NextResponse.json(updated[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(habits).where(eq(habits.id, Number(id)));
  return NextResponse.json({ ok: true });
}
