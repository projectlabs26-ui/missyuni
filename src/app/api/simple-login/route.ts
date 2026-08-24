import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Support both JSON and form-urlencoded
    let email: string, password: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else {
      // form-urlencoded or multipart
      const formData = await req.formData();
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    }

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=1", req.nextUrl.origin));
    }

    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, role, password")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.redirect(new URL("/login?error=1", req.nextUrl.origin));
    }

    const valid = user.password.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!valid) {
      return NextResponse.redirect(new URL("/login?error=1", req.nextUrl.origin));
    }

    // Upgrade plain text password to hash
    if (!user.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(password, 12);
      await supabase.from("User").update({ password: hashed }).eq("id", user.id);
    }

    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";
    const session = JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role });

    const response = NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
    response.cookies.set("session", session, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.redirect(new URL("/login?error=1", req.nextUrl.origin));
  }
}
