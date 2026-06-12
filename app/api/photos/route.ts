import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { photos } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** Upload a progress photo (multipart form: file, weighinId). */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const weighinId = Number(form.get("weighinId"));
  if (!(file instanceof File) || !weighinId) {
    return NextResponse.json({ error: "file and weighinId required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 15 MB" }, { status: 400 });
  }
  const blob = await put(`progress/${weighinId}/${Date.now()}-${file.name}`, file, {
    access: "public", // unguessable URL; never exposed — served via authed proxy below
    addRandomSuffix: true,
  });
  const inserted = await db
    .insert(photos)
    .values({ weighinId, url: blob.url, contentType: file.type })
    .returning();
  return NextResponse.json({ id: inserted[0].id });
}
