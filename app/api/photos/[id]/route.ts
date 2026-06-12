import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { photos } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** Authenticated proxy: streams the blob so its URL stays private. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await db.select().from(photos).where(eq(photos.id, Number(id)));
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const upstream = await fetch(rows[0].url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Blob fetch failed" }, { status: 502 });
  }
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": rows[0].contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await db.select().from(photos).where(eq(photos.id, Number(id)));
  if (rows.length) {
    await del(rows[0].url).catch(() => {});
    await db.delete(photos).where(eq(photos.id, Number(id)));
  }
  return NextResponse.json({ ok: true });
}
