import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { photos, weighins } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(weighins)
    .orderBy(desc(weighins.date), desc(weighins.id));
  const ids = rows.map((r) => r.id);
  const pics = ids.length
    ? await db.select().from(photos).where(inArray(photos.weighinId, ids))
    : [];
  const byWeighin = new Map<number, number[]>();
  for (const p of pics) {
    if (!byWeighin.has(p.weighinId)) byWeighin.set(p.weighinId, []);
    byWeighin.get(p.weighinId)!.push(p.id);
  }
  return NextResponse.json(
    rows.map((r) => ({ ...r, photoIds: byWeighin.get(r.id) ?? [] }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = String(body.date ?? "");
  const weightLb = Number(body.weightLb);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !weightLb || weightLb < 50 || weightLb > 800) {
    return NextResponse.json({ error: "date and weightLb required" }, { status: 400 });
  }
  const opt = (v: unknown) => {
    const n = Number(v);
    return v != null && v !== "" && Number.isFinite(n) && n > 0 ? n : null;
  };
  const inserted = await db
    .insert(weighins)
    .values({
      date,
      weightLb,
      neckIn: opt(body.neckIn),
      chestIn: opt(body.chestIn),
      bellyIn: opt(body.bellyIn),
      armIn: opt(body.armIn),
      note: body.note ? String(body.note) : null,
    })
    .returning();
  return NextResponse.json({ ...inserted[0], photoIds: [] });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Remove blobs first, then rows (cascade removes photo rows)
  const pics = await db.select().from(photos).where(eq(photos.weighinId, id));
  await Promise.all(pics.map((p) => del(p.url).catch(() => {})));
  await db.delete(weighins).where(eq(weighins.id, id));
  return NextResponse.json({ ok: true });
}
