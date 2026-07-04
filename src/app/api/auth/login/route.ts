import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, verifyCredentials, createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// tiny in-memory rate limit (per warm instance)
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  rec.n++;
  return rec.n > 8;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });

  let body: { user?: string; pass?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const user = String(body.user || "");
  const pass = String(body.pass || "");
  if (!user || !pass) return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });

  const matched = await verifyCredentials(user, pass);
  if (!matched) return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });

  const token = await createSession(matched);
  const res = NextResponse.json({ ok: true, user: matched });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
