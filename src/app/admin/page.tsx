import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, Clock, DollarSign, CheckCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";

export default async function AdminDashboardPage() {
  let totalStudents = 0;
  let totalCourses = 0;
  let pendingTransactions = 0;
  let totalRevenue = { _sum: { amount: 0 } };
  let recentTransactions: any[] = [];

  try {
    [totalStudents, totalCourses, pendingTransactions, totalRevenue, recentTransactions] =
      await Promise.all([
        db.user.count({ where: { role: "student" } }),
        db.course.count(),
        db.transaction.count({ where: { status: "pending" } }),
        db.transaction.aggregate({ where: { status: "approved" }, _sum: { amount: true } }),
        db.transaction.findMany({
          where: { status: "pending" },
          include: { user: true, course: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);
  } catch (e) {
    console.error("Dashboard query error:", e);
  }

  const stats = [
    { label: "Total Siswa", value: totalStudents, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Kelas", value: totalCourses, icon: BookOpen, color: "bg-purple-50 text-purple-600" },
    { label: "Menunggu Verifikasi", value: pendingTransactions, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Total Omzet", value: formatRupiah(totalRevenue._sum.amount || 0), icon: DollarSign, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-text-muted">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> Antrean Verifikasi
            </h2>
            <Link href="/admin/transactions" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-text-muted">Semua pembayaran sudah diverifikasi!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text">{tx.user.name}</p>
                      <p className="text-sm text-text-muted">{tx.course.title}</p>
                      <p className="text-xs text-text-muted">{tx.user.whatsapp || "No WA"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatRupiah(tx.amount)}</p>
                      <div className="flex gap-2 mt-2">
                        <Link href={`/admin/transactions/${tx.id}/approve`} className="btn-primary text-xs py-1.5 px-3">
                          Approve
                        </Link>
                        <Link href={`/admin/transactions/${tx.id}/reject`} className="text-xs py-1.5 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                          Tolak
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-text mb-4">Ringkasan</h2>
          <div className="card p-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-text-muted">Total Siswa</span>
              <span className="font-bold text-text">{totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Kelas</span>
              <span className="font-bold text-text">{totalCourses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Pending</span>
              <span className="font-bold text-amber-600">{pendingTransactions}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-text-muted">Omzet</span>
              <span className="font-bold text-green-600">{formatRupiah(totalRevenue._sum.amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}