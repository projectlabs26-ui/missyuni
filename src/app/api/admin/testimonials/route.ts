import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all testimonials
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("Testimonial")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Get testimonials error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST new testimonial
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, role, content, rating, isApproved } = await req.json();
    if (!name || !content) {
      return NextResponse.json({ error: "Nama dan konten wajib" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Testimonial")
      .insert({ name, role, content, rating: rating || 5, isApproved: isApproved ?? true })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Create testimonial error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}