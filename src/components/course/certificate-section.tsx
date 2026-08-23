"use client";

import { useState } from "react";
import { Award, Download } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import type { Certificate } from "@/types";

interface CertificateSectionProps {
  courseId: string;
  courseTitle: string;
  userName: string;
  certificate: Certificate | null;
  allModulesCompleted: boolean;
  allQuizzesPassed: boolean;
}

export function CertificateSection({
  courseId,
  courseTitle,
  userName,
  certificate,
  allModulesCompleted,
  allQuizzesPassed,
}: CertificateSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(certificate?.pdfUrl || null);

  const canGenerate = allModulesCompleted && allQuizzesPassed && !certificate;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPdfUrl(data.pdfUrl);
        toast("Sertifikat berhasil dibuat! 🎉", "success");
      } else {
        toast("Gagal membuat sertifikat", "error");
      }
    } catch {
      toast("Gagal membuat sertifikat", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-accent" />
        Sertifikat
      </h2>

      {certificate || pdfUrl ? (
        <div className="text-center py-6">
          <Award className="w-16 h-16 text-accent mx-auto mb-4" />
          <p className="text-lg font-bold text-text mb-1">Selamat, {userName}! 🎉</p>
          <p className="text-text-muted mb-4">
            Kamu telah menyelesaikan kelas {courseTitle}
          </p>
          <a
            href={pdfUrl || "#"}
            download
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Unduh Sertifikat (PDF)
          </a>
        </div>
      ) : canGenerate ? (
        <div className="text-center py-6">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-text mb-1">
            Kamu telah menyelesaikan semua modul dan kuis!
          </p>
          <p className="text-text-muted mb-4">
            Klik tombol di bawah untuk membuat sertifikat.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            {generating ? "Membuat..." : "Buat Sertifikat"}
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-muted">
            Selesaikan semua modul (100%) dan lulus semua kuis untuk mendapatkan sertifikat.
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p className={allModulesCompleted ? "text-green-600" : "text-text-muted"}>
              {allModulesCompleted ? "✅" : "⬜"} Semua modul selesai
            </p>
            <p className={allQuizzesPassed ? "text-green-600" : "text-text-muted"}>
              {allQuizzesPassed ? "✅" : "⬜"} Semua kuis lulus
            </p>
          </div>
        </div>
      )}
    </div>
  );
}