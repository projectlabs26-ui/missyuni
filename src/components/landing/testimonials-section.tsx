import { Star, Quote } from "lucide-react";
import type { SalesContent, TestimonialData } from "@/lib/homepage-data";

const defaultTestimonials: TestimonialData[] = [
  { id: "1", name: "Rina Amelia", role: "Siswi SMA Kelas 12", content: "Belajar bareng Miss Yuni tuh seru banget! Penjelasannya gampang dipahami, video-videonya juga engaging. Nilai Bahasa Inggrisku naik drastis dari 70 ke 95!", rating: 5, isApproved: true },
  { id: "2", name: "Dimas Ardiansyah", role: "Siswa SMK", content: "Awalnya aku benci Bahasa Inggris, tapi setelah ikut kelas Basic English di Missyuni, sekarang aku jadi suka. Metodenya asik dan gak bikin bosen.", rating: 5, isApproved: true },
  { id: "3", name: "Anisa Putri", role: "Mahasiswi", content: "Kelas TOEFL Preparation-nya sangat membantu! Materinya lengkap dan banyak latihan soal. Aku berhasil dapet skor 550 di TOEFL ITP. Thank you Miss Yuni!", rating: 5, isApproved: true },
];

export function TestimonialsSection({ testimonials, sectionData }: { testimonials: TestimonialData[]; sectionData: SalesContent | null }) {
  const items = testimonials.length > 0 ? testimonials : defaultTestimonials;
  const title = sectionData?.title || "Apa Kata Mereka?";
  const subtitle = sectionData?.subtitle || "Ratusan siswa sudah merasakan manfaat belajar di Missyuni. Ini cerita mereka.";

  return (
    <section id="testimonials" className="py-16 md:py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-lg">{subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.id} className="card p-6 relative">
              <Quote className="w-8 h-8 text-primary/15 absolute top-4 right-4" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? "fill-accent text-accent" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-text text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-text">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
