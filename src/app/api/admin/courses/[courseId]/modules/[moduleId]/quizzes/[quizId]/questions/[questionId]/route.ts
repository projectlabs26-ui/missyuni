import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; quizId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const { text, options, correctIndex, order } = await req.json();

    const question = await db.question.update({
      where: { id: questionId },
      data: {
        text,
        options: JSON.stringify(options),
        correctIndex,
        order,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; quizId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;

    await db.question.delete({ where: { id: questionId } });

    return NextResponse.json({ message: "Soal dihapus" });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
