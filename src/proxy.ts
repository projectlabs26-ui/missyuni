import { NextRequest, NextResponse } from "next/server";

function getSession(req: NextRequest) {
  const cookie = req.cookies.get("session");
  if (!cookie) return null;
  try {
    // Try base64 decode first (new format)
    try {
      const decoded = atob(cookie.value);
      return JSON.parse(decoded);
    } catch {
      // Fallback: raw JSON (old format)
      return JSON.parse(cookie.value);
    }
  } catch {
    return null;
  }
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getSession(req);

  // Public routes - no auth needed
  const publicPaths = ["/", "/login", "/register"];
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/simple-login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/logout") ||
    pathname.startsWith("/api/admin/create-admin") ||
    pathname === "/admin/setup"
  ) {
    return NextResponse.next();
  }

  // Static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - only admin allowed
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icons|.*\\..*).*)"],
};
