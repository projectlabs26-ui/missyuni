"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { formatRupiah } from "@/lib/utils";
import type { Course } from "@/types";

// QRIS Missyuni
const QRIS_IMAGE = "/qrisyuni.jpg";

export function CheckoutForm({ course }: { course: Course }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [whatsapp, setWhatsapp] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      toast("Silakan upload bukti transfer terlebih dahulu", "error");
      return;
    }

    setLoading(true);

    try {
      // Upload bukti transfer
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("courseId", course.id);
      formData.append("amount", course.price.toString());
      formData.append("whatsapp", whatsapp);

      const uploadRes = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        toast("Pembayaran berhasil diupload! Menunggu verifikasi admin.", "success");
        router.push("/dashboard");
        router.refresh();
      } else {
        const err = await uploadRes.json();
        toast(err.error || "Gagal upload bukti transfer", "error");
      }
    } catch {
      toast("Gagal mengirim. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* QRIS */}
      <div className="card p-6">
        <h3 className="font-semibold text-text mb-4 text-center">
          Scan QRIS untuk Pembayaran
        </h3>

        <div className="text-center">
          <div className="w-56 h-56 mx-auto mb-4 rounded-xl overflow-hidden border border-gray-200">
            <img
              src={QRIS_IMAGE}
              alt="QRIS Pembayaran"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-text-muted mb-1">
            Total Pembayaran:
          </p>
          <p className="text-2xl font-bold text-primary mb-2">
            {formatRupiah(course.price)}
          </p>
          <p className="text-xs text-text-muted">
            Scan QRIS di atas untuk membayar, lalu upload bukti transfer di bawah.
          </p>
        </div>
      </div>

      {/* Upload Bukti */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h3 className="font-semibold text-text flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Bukti Transfer
        </h3>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Nomor WhatsApp (untuk konfirmasi)
          </label>
          <input
            type="tel"
            placeholder="0812-3456-7890"
            className="input-field"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Foto Bukti Transfer
          </label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
            {proofFile ? (
              <div className="text-center">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                <p className="text-sm text-text font-medium">{proofFile.name}</p>
                <p className="text-xs text-text-muted">
                  {(proofFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">
                  Klik untuk upload gambar (JPG/PNG)
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !proofFile}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? "Mengirim..." : "Kirim Bukti Transfer"}
        </button>

        <p className="text-xs text-text-muted text-center">
          Admin akan memverifikasi pembayaran kamu dalam 1x24 jam. 
          Akses kelas akan dibuka otomatis setelah disetujui.
        </p>
      </form>
    </div>
  );
}