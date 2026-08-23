import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT update testimonial
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, role, content, rating, isApproved } = await req.json();

    const { data, error } = await supabase
      .from("Testimonial")
      .update({ name, role, content, rating, isApproved })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Update testimonial error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE testimonial
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabase.from("Testimonial").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete testimonial error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}