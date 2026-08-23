import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const modules = await db.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        quizzes: {
          include: { questions: { orderBy: { order: "asc" } } },
        },
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Get modules error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const { title, description, order, videoUrl, pdfUrl, audioUrl, duration } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Judul modul diperlukan" }, { status: 400 });
    }

    const module = await db.module.create({
      data: {
        courseId,
        title,
        description,
        order: order || 0,
        videoUrl,
        pdfUrl,
        audioUrl,
        duration,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
