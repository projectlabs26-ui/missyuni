import Link from "next/link";
import { ArrowRight, Zap, Gift } from "lucide-react";
import type { SalesContent } from "@/lib/homepage-data";

const defaults = {
  badge: "Gratis! Tidak Perlu Kartu Kredit",
  title: "Siap Menguasai Bahasa Inggris?",
  subtitle: "Daftar sekarang dan dapatkan akses gratis ke materi percobaan. Mulai perjalanan belajarmu bersama Miss Yuni hari ini!",
};

export function CTASection({ data }: { data: SalesContent | null }) {
  const badge = data?.body || defaults.badge;
  const title = data?.title || defaults.title;
  const subtitle = data?.subtitle || defaults.subtitle;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom relative text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Gift className="w-4 h-4" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">{subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg
                hover:bg-gray-100 transition-all duration-200 active:scale-95
                inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Daftar Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#courses"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg
                hover:bg-white/10 transition-all duration-200
                inline-flex items-center justify-center gap-2"
            >
              Lihat Katalog Kelas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}