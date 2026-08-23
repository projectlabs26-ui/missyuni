import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, role, password")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const valid = user.password.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Upgrade plain text password to hash
    if (!user.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(password, 12);
      await supabase.from("User").update({ password: hashed }).eq("id", user.id);
    }

    const redirect = user.role === "admin" ? "/admin" : "/dashboard";
    const sessionData = { id: user.id, name: user.name, email: user.email, role: user.role };
    const session = btoa(JSON.stringify(sessionData));

    const response = NextResponse.json({ redirect });
    response.cookies.set("session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}