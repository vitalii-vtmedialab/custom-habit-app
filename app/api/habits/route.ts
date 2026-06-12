import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { habits } from "@/lib/schema";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const includeArchived = req.nextUrl.searchParams.get("archived") === "1";
  const rows = includeArchived
    ? await db.select().from(habits).orderBy(habits.sort, habits.id)
    : await db.select().from(habits).where(eq(habits.archived, false)).orderBy(habits.sort, habits.id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const type = body.type === "quantity" ? "quantity" : "check";
  const targetPerDay = type === "quantity" ? Math.max(1, Math.min(50, Number(body.targetPerDay) || 1)) : 1;
  const inserted = await db
    .insert(habits)
    .values({
      name,
      type,
      targetPerDay,
      icon: String(body.icon ?? "circle-check"),
      color: String(body.color ?? "#007AFF"),
      startDate: /^\d{4}-\d{2}-\d{2}$/.test(body.startDate) ? body.startDate : todayKey(),
      endDate: /^\d{4}-\d{2}-\d{2}$/.test(body.endDate) ? body.endDate : null,
    })
    .returning();
  return NextResponse.json(inserted[0]);
}
