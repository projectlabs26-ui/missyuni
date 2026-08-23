import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, secret } = await req.json();

    if (secret !== "missyuni-admin-2024") {
      return NextResponse.json({ error: "Secret salah" }, { status: 403 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      // Upgrade to admin
      const { error } = await supabase
        .from("User")
        .update({ role: "admin" })
        .eq("email", email);

      if (error) throw error;
      return NextResponse.json({ message: "User diupgrade ke admin", email });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { error } = await supabase.from("User").insert({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    if (error) throw error;

    return NextResponse.json({ message: "Admin berhasil dibuat", email }, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
