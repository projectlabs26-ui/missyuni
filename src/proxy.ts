import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  // Proxy tanpa auth check - halaman sendiri yang handle auth
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icons).*)"],
};
