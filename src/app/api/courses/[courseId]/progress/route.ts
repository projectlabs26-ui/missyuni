import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const { moduleId, completed } = await req.json();

    const enrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    // Upsert module progress
    const existing = await db.moduleProgress.findFirst({
      where: {
        enrollmentId: enrollment.id,
        moduleId,
      },
    });

    if (existing) {
      await db.moduleProgress.update({
        where: { id: existing.id },
        data: {
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        },
      });
    } else {
      await db.moduleProgress.create({
        data: {
          enrollmentId: enrollment.id,
          moduleId,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        },
      });
    }

    // Recalculate overall progress
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { modules: true },
    });

    const allProgresses = await db.moduleProgress.findMany({
      where: { enrollmentId: enrollment.id },
    });

    const totalModules = course?.modules.length || 1;
    const completedModules = allProgresses.filter((p) => p.completed).length;
    const progress = Math.min(Math.round((completedModules / totalModules) * 100), 100);

    const updateData: any = { progress };
    if (progress === 100) {
      updateData.completedAt = new Date().toISOString();
    }

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: updateData,
    });

    return NextResponse.json({ progress, completedModules, totalModules });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}