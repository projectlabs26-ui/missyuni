import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, whatsapp, currentPassword, newPassword } = await req.json();

    const updateData: any = { name, whatsapp };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Password saat ini diperlukan" }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}