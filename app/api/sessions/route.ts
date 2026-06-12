import { NextRequest, NextResponse } from "next/server";
import { and, desc, gte, lte, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/schema";
import { computeSession } from "@/lib/calc";
import { getCurrentWeightLb, getProfile } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const conds = [];
  if (from) conds.push(gte(sessions.date, from));
  if (to) conds.push(lte(sessions.date, to));
  const rows = await db
    .select()
    .from(sessions)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(sessions.date), desc(sessions.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const durationMin = Number(body.durationMin);
  const speedMph = Number(body.speedMph);
  const date = String(body.date ?? "");
  if (!durationMin || !speedMph || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "durationMin, speedMph, date required" }, { status: 400 });
  }
  if (durationMin <= 0 || durationMin > 600 || speedMph <= 0 || speedMph > 7) {
    return NextResponse.json({ error: "Out of range" }, { status: 400 });
  }
  const [prof, weightLb] = await Promise.all([getProfile(), getCurrentWeightLb()]);
  const metrics = computeSession({
    durationMin,
    speedMph,
    heightIn: prof.heightIn,
    weightLb,
    gender: prof.gender,
  });
  const inserted = await db
    .insert(sessions)
    .values({ date, durationMin, speedMph, ...metrics })
    .returning();
  return NextResponse.json(inserted[0]);
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(sessions).where(eq(sessions.id, id));
  return NextResponse.json({ ok: true });
}
