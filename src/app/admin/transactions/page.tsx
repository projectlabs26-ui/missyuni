export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatRupiah, formatDate } from "@/lib/utils";

export default async function AdminTransactionsPage() {
  const transactions = await db.transaction.findMany({
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Riwayat Transaksi</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-4 text-sm font-semibold text-text">Siswa</th>
                <th className="p-4 text-sm font-semibold text-text">Kelas</th>
                <th className="p-4 text-sm font-semibold text-text">Jumlah</th>
                <th className="p-4 text-sm font-semibold text-text">Status</th>
                <th className="p-4 text-sm font-semibold text-text">Tanggal</th>
                <th className="p-4 text-sm font-semibold text-text">Bukti</th>
                <th className="p-4 text-sm font-semibold text-text">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-gray-100">
                  <td className="p-4">
                    <p className="font-medium text-text">{tx.user.name}</p>
                    <p className="text-xs text-text-muted">{tx.user.whatsapp}</p>
                  </td>
                  <td className="p-4 text-sm text-text">{tx.course.title}</td>
                  <td className="p-4 font-medium text-text">{formatRupiah(tx.amount)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[tx.status]}`}>
                      {statusLabels[tx.status]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-muted">{formatDate(tx.createdAt)}</td>
                  <td className="p-4">
                    {tx.paymentProof && (
                      <a href={tx.paymentProof} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                        Lihat
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    {tx.status === "pending" && (
                      <div className="flex gap-2">
                        <Link href={`/admin/transactions/${tx.id}/approve`} className="btn-primary text-xs py-1.5 px-3">
                          Approve
                        </Link>
                        <Link href={`/admin/transactions/${tx.id}/reject`} className="text-xs py-1.5 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                          Tolak
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}