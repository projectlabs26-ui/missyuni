import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!_next|favicon\\.ico|icons|logomissyuni|hero\\.png|qrisyuni).*)"],
};
