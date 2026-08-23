import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;
    const { title, description, videoUrl, pdfUrl, audioUrl, duration, order } = await req.json();

    const module = await db.module.update({
      where: { id: moduleId },
      data: { title, description, videoUrl, pdfUrl, audioUrl, duration, order },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;

    await db.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ message: "Modul dihapus" });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
