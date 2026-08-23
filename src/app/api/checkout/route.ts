import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;
    const amount = formData.get("amount") as string;
    const whatsapp = formData.get("whatsapp") as string;

    if (!file || !courseId || !amount) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Check course exists
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId },
    });
    if (existing) {
      return NextResponse.json({ error: "Kamu sudah terdaftar di kelas ini" }, { status: 400 });
    }

    // Check pending transaction
    const pendingTx = await db.transaction.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: "pending",
      },
    });
    if (pendingTx) {
      return NextResponse.json({ error: "Pembayaran sedang diverifikasi" }, { status: 400 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${session.user.id}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const paymentProof = `/uploads/payments/${fileName}`;

    // Create transaction
    await db.transaction.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: parseFloat(amount),
        paymentProof,
        status: "pending",
      },
    });

    // Update user's WhatsApp if provided
    if (whatsapp) {
      await db.user.update({
        where: { id: session.user.id },
        data: { whatsapp },
      });
    }

    return NextResponse.json({ message: "Pembayaran berhasil diupload" }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}