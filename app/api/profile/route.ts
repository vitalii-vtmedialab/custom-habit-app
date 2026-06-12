import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profile } from "@/lib/schema";
import { getProfile } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getProfile());
}

export async function PATCH(req: NextRequest) {
  await getProfile(); // ensure row exists
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : null);
  if (num(body.heightIn)) patch.heightIn = num(body.heightIn);
  if (num(body.birthYear)) patch.birthYear = num(body.birthYear);
  if (body.gender === "male" || body.gender === "female") patch.gender = body.gender;
  if (num(body.stepGoal)) patch.stepGoal = Math.round(num(body.stepGoal)!);
  if (num(body.calorieGoal)) patch.calorieGoal = Math.round(num(body.calorieGoal)!);
  if (num(body.fallbackWeightLb)) patch.fallbackWeightLb = num(body.fallbackWeightLb);
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const updated = await db.update(profile).set(patch).where(eq(profile.id, 1)).returning();
  return NextResponse.json(updated[0]);
}
