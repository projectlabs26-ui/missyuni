export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ProfileForm } from "@/components/auth/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        include: { course: true },
        orderBy: { createdAt: "desc" },
      },
      certificates: {
        include: { course: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-custom py-8 max-w-2xl">
        <a href="/dashboard" className="text-text-muted hover:text-primary mb-4 inline-block">
          ← Kembali ke Dashboard
        </a>
        <h1 className="text-2xl font-bold text-text mb-8">Profil Saya</h1>

        <ProfileForm user={user} />

        {/* Riwayat Transaksi */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text mb-4">Riwayat Transaksi</h2>
          {user.transactions.length === 0 ? (
            <p className="text-text-muted text-sm">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-3">
              {user.transactions.map((tx: any) => (
                <div key={tx.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text text-sm">{tx.course.title}</p>
                    <p className="text-xs text-text-muted">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.status === "approved" ? "bg-green-100 text-green-700" :
                    tx.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {tx.status === "approved" ? "Disetujui" :
                     tx.status === "pending" ? "Menunggu" : "Ditolak"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sertifikat */}
        {user.certificates.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-text mb-4">Sertifikat</h2>
            <div className="space-y-3">
              {user.certificates.map((cert: any) => (
                <div key={cert.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text text-sm">{cert.course.title}</p>
                    <p className="text-xs text-text-muted">Kode: {cert.code}</p>
                  </div>
                  <a href={cert.pdfUrl || "#"} className="btn-primary text-xs py-1.5 px-3" target="_blank">
                    Unduh
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}