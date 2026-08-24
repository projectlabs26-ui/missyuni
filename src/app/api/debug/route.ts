import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  // Check DB connection
  let dbOk = false;
  let dbError = "";
  try {
    const { data, error } = await supabase.from("User").select("id").limit(1);
    if (error) {
      dbError = error.message;
    } else {
      dbOk = true;
    }
  } catch (e: any) {
    dbError = e.message || "unknown";
  }

  return NextResponse.json({
    session: session ? { id: session.user.id, name: session.user.name, role: session.user.role } : null,
    dbConnected: dbOk,
    dbError: dbError,
    cookies: req.cookies.get("session") ? "present" : "missing",
  });
}
