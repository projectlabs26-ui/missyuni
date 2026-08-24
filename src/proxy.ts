import { NextRequest, NextResponse } from "next/server";

export function proxy(_req: NextRequest) {
  // No-op: pass all requests through directly
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [], // Empty = proxy never runs
};
