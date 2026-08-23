import Link from "next/link";
import { ArrowRight, Star, Users, Award, PlayCircle } from "lucide-react";
import type { SalesContent } from "@/lib/homepage-data";

const defaults = {
  badge: "#1 Platform Belajar Bahasa Inggris",
  title: "Belajar Bahasa Inggris Mudah & Menyenangkan Bersama Miss Yuni",
  subtitle: "Dari pemula hingga mahir. Kuasai grammar, speaking, listening, dan persiapan ujian dengan metode belajar yang interaktif dan terstruktur.",
};

export function HeroSection({ data }: { data: SalesContent | null }) {
  const badge = data?.body || defaults.badge;
  const title = data?.title || defaults.title;
  const subtitle = data?.subtitle || defaults.subtitle;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface to-white py-16 md:py-24">
      <div className="absolute top-10 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-custom relative">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-primary" />
              <span>{badge}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-text">
              {title}
            </h1>

            <p className="text-text-muted text-lg leading-relaxed max-w-lg">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-lg">
                Mulai Belajar Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/#courses" className="btn-outline inline-flex items-center gap-2 text-lg">
                <PlayCircle className="w-5 h-5" />
                Lihat Kelas
              </Link>
            </div>

            <div className="flex gap-6 pt-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold text-text">
                  <Users className="w-5 h-5 text-primary" />500+
                </div>
                <p className="text-sm text-text-muted">Siswa Aktif</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold text-text">
                  <Award className="w-5 h-5 text-accent" />10+
                </div>
                <p className="text-sm text-text-muted">Kelas Tersedia</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold text-text">
                  <Star className="w-5 h-5 text-accent fill-accent" />4.9
                </div>
                <p className="text-sm text-text-muted">Rating</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center order-first md:order-last">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <img
                src={data?.imageUrl || "/hero.png"}
                alt="Miss Yuni - Belajar Bahasa Inggris"
                className="w-full h-full object-cover rounded-3xl shadow-2xl shadow-primary/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}