import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await db.transaction.findMany({
      where: { status: "approved" },
      include: { user: true, course: true },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = ["Tanggal", "Nama Siswa", "Email", "WhatsApp", "Kelas", "Jumlah", "Status"];
    const rows = transactions.map((tx) => [
      tx.createdAt.toISOString().split("T")[0],
      tx.user.name,
      tx.user.email,
      tx.user.whatsapp || "",
      tx.course.title,
      tx.amount.toString(),
      tx.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="laporan-transaksi-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}