import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Cek apakah email sudah terdaftar
    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru
    const { data: user, error } = await supabase
      .from("User")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
      })
      .select()
      .single();

    if (error || !user) {
      console.error("Register error:", error);
      return NextResponse.json(
        { error: "Gagal mendaftar. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Return session data — client will set cookie
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectPath: "/dashboard",
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
