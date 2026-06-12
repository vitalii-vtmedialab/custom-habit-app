import { NextRequest, NextResponse } from "next/server";

async function expectedToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`habit-app:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const pin = process.env.APP_PIN;
  // If no PIN configured, let everything through (local dev convenience)
  if (!pin) return NextResponse.next();

  const cookie = req.cookies.get("habit_auth")?.value;
  if (cookie && cookie === (await expectedToken(pin))) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/pin";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Protect everything except:
     * - /pin (the gate itself) and /api/auth (PIN submission)
     * - Next.js internals and static assets
     */
    "/((?!pin|api/auth|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|robots.txt).*)",
  ],
};
