import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { strengthSessions } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const conds = [];
  if (from) conds.push(gte(strengthSessions.date, from));
  if (to) conds.push(lte(strengthSessions.date, to));
  const rows = await db
    .select()
    .from(strengthSessions)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(strengthSessions.date), desc(strengthSessions.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = String(body.date ?? "");
  const durationMin = Math.round(Number(body.durationMin));
  const location = body.location === "gym" ? "gym" : "home";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !durationMin || durationMin <= 0 || durationMin > 600) {
    return NextResponse.json({ error: "date and durationMin required" }, { status: 400 });
  }
  const inserted = await db
    .insert(strengthSessions)
    .values({ date, durationMin, location })
    .returning();
  return NextResponse.json(inserted[0]);
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(strengthSessions).where(eq(strengthSessions.id, id));
  return NextResponse.json({ ok: true });
}
