import { NextRequest, NextResponse } from "next/server";
import { authToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const expected = process.env.APP_PIN;
  if (!expected) {
    return NextResponse.json({ error: "APP_PIN not configured" }, { status: 500 });
  }
  if (typeof pin !== "string" || pin !== expected) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("habit_auth", authToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year — it's your own app
    path: "/",
  });
  return res;
}
