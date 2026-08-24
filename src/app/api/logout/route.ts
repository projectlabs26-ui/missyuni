import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Return JSON — client will clear cookie and redirect
  return NextResponse.json({ success: true, message: "Logged out" });
}
