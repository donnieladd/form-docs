import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

// Public (no auth): landing, login page, and the login/logout APIs.
const PUBLIC_PATHS = ["/", "/login", "/api/auth/login", "/api/auth/logout"];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  return false;
}

function harden(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return harden(NextResponse.next());

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifySession(token);
  if (user) return harden(NextResponse.next());

  // API calls get 401; page requests get redirected to /login.
  if (pathname.startsWith("/api/")) {
    return harden(NextResponse.json({ error: "unauthorized" }, { status: 401 }));
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return harden(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)"],
};
