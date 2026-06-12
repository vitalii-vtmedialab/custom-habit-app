import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { del, get } from "@vercel/blob";
import { db } from "@/lib/db";
import { photos } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** Authenticated proxy: streams from the private Blob store. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await db.select().from(photos).where(eq(photos.id, Number(id)));
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const result = await get(rows[0].pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: "Blob fetch failed" }, { status: 502 });
  }
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? rows[0].contentType,
      "X-Content-Type-Options": "nosniff",
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
