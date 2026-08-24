import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    // Only match page routes, not API, not static files
    "/((?!_next|api|favicon\\.ico|icons|logomissyuni|hero\\.png|qrisyuni|icon-|manifest).*)",
  ],
};
